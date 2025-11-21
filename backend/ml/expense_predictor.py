import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta

class ExpensePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=12,
            random_state=42
        )
        self.is_trained = False

    def preprocess(self, transactions):
        df = pd.DataFrame(transactions)

        # Keep only expenses
        df = df[df["type"].str.lower() == "expense"]

        # Convert date properly
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")

        # Aggregate per day (your DB has multiple entries per day)
        daily = df.groupby("date")["amount"].sum().reset_index()

        # Fill missing days
        full_range = pd.date_range(start=daily["date"].min(), end=daily["date"].max())
        daily = daily.set_index("date").reindex(full_range, fill_value=0)
        daily = daily.rename_axis("date").reset_index()

        # Time features
        daily["day_of_week"] = daily["date"].dt.dayofweek
        daily["month"] = daily["date"].dt.month
        daily["is_weekend"] = daily["day_of_week"].isin([5, 6]).astype(int)
        daily["roll7"] = daily["amount"].rolling(7, min_periods=1).mean()
        daily["roll30"] = daily["amount"].rolling(30, min_periods=1).mean()

        return daily

    def make_windows(self, df, window=7):
        X, y = [], []

        for i in range(window, len(df)):
            past = df["amount"].values[i-window:i]

            features = list(past) + [
                df.loc[i, "day_of_week"],
                df.loc[i, "month"],
                df.loc[i, "is_weekend"],
                df.loc[i, "roll7"],
                df.loc[i, "roll30"]
            ]

            X.append(features)
            y.append(df.loc[i, "amount"])

        return np.array(X), np.array(y)

    def train(self, transactions):
        df = self.preprocess(transactions)

        if len(df) < 30:
            return {"success": False, "message": "Need at least 30 days of expense data."}

        X, y = self.make_windows(df)

        if len(X) < 10:
            return {"success": False, "message": "Not enough data patterns for training."}

        self.model.fit(X, y)
        self.is_trained = True

        return {"success": True, "message": "Model trained successfully."}

    def predict_next_7(self, transactions):
        if not self.is_trained:
            result = self.train(transactions)
            if not result["success"]:
                return result

        df = self.preprocess(transactions)
        last7 = df["amount"].values[-7:]
        last_date = df["date"].iloc[-1]

        predictions = []

        for i in range(1, 8):
            next_date = last_date + timedelta(days=i)

            features = list(last7) + [
                next_date.weekday(),
                next_date.month,
                1 if next_date.weekday() in [5, 6] else 0,
                np.mean(last7),
                np.mean(df["amount"].tail(30))
            ]

            amount = max(0, float(self.model.predict([features])[0]))

            predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_amount": round(amount, 2),
                "day_of_week": next_date.strftime("%A")
            })

            last7 = np.append(last7[1:], amount)

        total = sum(p["predicted_amount"] for p in predictions)

        return {
            "success": True,
            "predictions": predictions,
            "total_predicted": round(total, 2)
        }

if __name__ == "__main__":
    input_json = sys.argv[1]
    transactions = json.loads(input_json)

    model = ExpensePredictor()
    print(json.dumps(model.predict_next_7(transactions)))
