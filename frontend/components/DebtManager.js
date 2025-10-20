import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DebtManager() {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    name: "",
    balance: "",
    interestRate: "",
    minPayment: "",
  });
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [results, setResults] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE"];

  const addDebt = () => {
    if (
      !newDebt.name ||
      !newDebt.balance ||
      !newDebt.interestRate ||
      !newDebt.minPayment
    ) {
      alert("Please fill all fields");
      return;
    }

    setDebts([...debts, newDebt]);
    setNewDebt({ name: "", balance: "", interestRate: "", minPayment: "" });
  };

  const removeDebt = (index) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const calculateDebtPayoff = () => {
    if (debts.length === 0) {
      alert("Please add at least one debt");
      return;
    }

    if (!monthlyBudget) {
      alert("Please enter your total monthly budget");
      return;
    }

    const snowballOrder = [...debts].sort(
      (a, b) => parseFloat(a.balance) - parseFloat(b.balance)
    );
    const avalancheOrder = [...debts].sort(
      (a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate)
    );

    const simulatePayoff = (order) => {
      let months = 0;
      let totalPaid = 0;
      const debtsCopy = order.map((d) => ({
        ...d,
        balance: parseFloat(d.balance),
        interestRate: parseFloat(d.interestRate),
        minPayment: parseFloat(d.minPayment),
      }));

      while (debtsCopy.some((d) => d.balance > 0) && months < 600) {
        months++;
        let remainingBudget = parseFloat(monthlyBudget);
        for (let d of debtsCopy) {
          if (d.balance <= 0) continue;

          const interest = (d.balance * d.interestRate) / 1200;
          let payment = Math.min(d.minPayment, d.balance + interest);
          if (remainingBudget > 0) {
            const extra = remainingBudget - payment >= 0 ? 0 : remainingBudget;
            payment += extra;
            remainingBudget -= payment;
          }
          d.balance += interest - payment;
          if (d.balance < 0) d.balance = 0;
          totalPaid += payment;
        }
      }

      return { months, totalPaid };
    };

    const snowball = simulatePayoff(snowballOrder);
    const avalanche = simulatePayoff(avalancheOrder);

    setResults({ snowball, avalanche });
  };

  return (
    <div className="debt-manager">
      <h2 className="header">💳 Debt Manager</h2>

      <div className="form-section">
        <input
          type="text"
          placeholder="Debt Name"
          value={newDebt.name}
          onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Balance (₹)"
          value={newDebt.balance}
          onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={newDebt.interestRate}
          onChange={(e) =>
            setNewDebt({ ...newDebt, interestRate: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Min Payment (₹)"
          value={newDebt.minPayment}
          onChange={(e) =>
            setNewDebt({ ...newDebt, minPayment: e.target.value })
          }
        />
        <button onClick={addDebt}>Add Debt</button>
      </div>

      <div className="budget-section">
        <input
          type="number"
          placeholder="Total Monthly Budget (₹)"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value)}
        />
        <button onClick={calculateDebtPayoff}>Calculate Payoff</button>
      </div>

      <div className="debts-list">
        <h3>Current Debts</h3>
        {debts.length === 0 ? (
          <p>No debts added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Balance</th>
                <th>Rate</th>
                <th>Min Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d, index) => (
                <tr key={index}>
                  <td>{d.name}</td>
                  <td>₹{d.balance}</td>
                  <td>{d.interestRate}%</td>
                  <td>₹{d.minPayment}</td>
                  <td>
                    <button onClick={() => removeDebt(index)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {results && (
        <div className="results-section">
          <h3>📊 Payoff Results</h3>
          <div className="result-cards">
            <div className="metric-card">
              <h4>Debt-Free By (Snowball)</h4>
              <p>
                {results
                  ? `${Math.floor(results.snowball.months / 12)}Y ${
                      results.snowball.months % 12
                    }M`
                  : "N/A"}
              </p>
            </div>
            <div className="metric-card">
              <h4>Debt-Free By (Avalanche)</h4>
              <p>
                {results
                  ? `${Math.floor(results.avalanche.months / 12)}Y ${
                      results.avalanche.months % 12
                    }M`
                  : "N/A"}
              </p>
            </div>
          </div>

          <PieChart width={400} height={300}>
            <Pie
              data={[
                { name: "Snowball", value: results.snowball.totalPaid },
                { name: "Avalanche", value: results.avalanche.totalPaid },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {[
                { name: "Snowball", value: results.snowball.totalPaid },
                { name: "Avalanche", value: results.avalanche.totalPaid },
              ].map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `₹${value.toLocaleString("en-IN")}`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </div>
      )}

      <style jsx>{`
        .debt-manager {
          padding: 2rem;
          background: #f9fafb;
          border-radius: 16px;
        }
        .header {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1e3a8a;
        }
        .form-section,
        .budget-section {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        input {
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          outline: none;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        button:hover {
          background: #1e40af;
        }
        .debts-list table {
          width: 100%;
          border-collapse: collapse;
        }
        .debts-list th,
        .debts-list td {
          padding: 0.75rem;
          border-bottom: 1px solid #ddd;
        }
        .metric-card {
          background: #fff;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin: 1rem;
          width: 200px;
        }
        .metric-card h4 {
          color: #1e3a8a;
          margin-bottom: 0.5rem;
        }
        .result-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
