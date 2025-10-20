import React, { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// A function to format large numbers on the Y-axis for readability
const formatYAxis = (tickItem) => {
  if (tickItem >= 10000000) {
    return `${(tickItem / 10000000).toFixed(1)} Cr`;
  }
  if (tickItem >= 100000) {
    return `${(tickItem / 100000).toFixed(1)} L`;
  }
  return tickItem.toLocaleString();
};

// A custom tooltip for a cleaner and more professional look
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Year ${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.stroke, margin: "4px 0" }}>
            {`${pld.name}: ₹${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GoalCalculator() {
  const [goalType, setGoalType] = useState("Buying a Car");
  const [customGoal, setCustomGoal] = useState("");
  const [targetAmount, setTargetAmount] = useState(800000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [returnRate, setReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [result, setResult] = useState(null);

  const goalTypes = [
    "Buying a Car",
    "Purchasing a Laptop/Gadget",
    "Planning a Foreign Trip",
    "Building Emergency Fund",
    "House Down Payment",
    "Dream Watch/Jewelry",
    "Wedding",
    "Education",
    "Other",
  ];

  const getFinalGoalType = () =>
    goalType === "Other" ? customGoal || "Custom Goal" : goalType;

  const calculateGoal = () => {
    const r = returnRate / 100;
    const i = inflationRate / 100;
    const t = timeHorizon;

    const adjustedGoal = targetAmount * Math.pow(1 + i, t);
    const futureCurrentSavings = currentSavings * Math.pow(1 + r, t);
    const amountNeeded = adjustedGoal - futureCurrentSavings;

    if (amountNeeded <= 0) {
        setResult({
            adjustedGoal: Math.round(adjustedGoal),
            monthlySIP: 0,
            lumpsum: 0,
            totalInvested: Math.round(currentSavings),
            sipIncrease: 0,
            yearlyData: [],
            message: "Your current savings are sufficient to meet your goal!"
        });
        return;
    }

    const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
    const months = t * 12;
    const monthlySIP =
      (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    const lumpsum = amountNeeded / Math.pow(1 + r, t);

    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const m = year * 12;
      const sipValue =
        monthlySIP *
        ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
         
      const savingsValue = currentSavings * Math.pow(1 + r, year);
      const goalValue = targetAmount * Math.pow(1 + i, year);
      yearlyData.push({
        year,
        invested: Math.round(monthlySIP * m + currentSavings),
        value: Math.round(sipValue + savingsValue),
        goal: Math.round(goalValue),
      });
    }

    const sipIncrease = Math.round(inflationRate / 2);
    setResult({
      adjustedGoal: Math.round(adjustedGoal),
      monthlySIP: Math.round(monthlySIP),
      lumpsum: Math.round(lumpsum),
      totalInvested: Math.round(monthlySIP * months + currentSavings),
      sipIncrease,
      yearlyData,
      message: null
    });
  };

  return (
    <div className="calculator-container">
      <h2>🎯 Goal Investment Calculator</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
        Plan your investments smartly to reach your dream goal
      </p>

      {/* Inputs */}
      <div className="input-section">
        <div className="input-group">
          <label>Select Your Goal</label>
          <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
            {goalTypes.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {goalType === "Other" && (
            <input
              type="text"
              placeholder="Enter your custom goal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="custom-goal-input"
            />
          )}
        </div>

        <div className="input-group">
          <label>Target Amount (Today's Value)</label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            placeholder="e.g., 800000"
          />
        </div>

        <div className="input-group">
          <label>Current Savings for this Goal</label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(Number(e.target.value))}
            placeholder="e.g., 50000"
          />
        </div>

        <div className="input-group-row">
            <div className="input-group">
                <label>Time Horizon (Years)</label>
                <input
                type="number"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                min="1"
                />
            </div>
            <div className="input-group">
                <label>Return Rate (% p.a.)</label>
                <input
                type="number"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                step="0.5"
                />
            </div>
            <div className="input-group">
                <label>Inflation Rate (% p.a.)</label>
                <input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                step="0.5"
                />
            </div>
        </div>

      </div>

      <button onClick={calculateGoal} className="calculate-btn">
        Calculate My Goal Plan
      </button>

      {result && (
        <div className="results">
          {result.message ? (
             <div className="result-card-full">
                <h3>Congratulations!</h3>
                <p>{result.message}</p>
             </div>
          ) : (
            <>
            <div className="result-summary">
                <p>To achieve your goal of <strong>{getFinalGoalType()}</strong>, which will cost <strong>₹{result.adjustedGoal.toLocaleString()}</strong> in {timeHorizon} years, you can either:</p>
            </div>
            <div className="results-grid">
                <div className="result-card">
                <h3>Invest Monthly (SIP)</h3>
                <p className="amount gain">₹{result.monthlySIP.toLocaleString()}</p>
                <small>You should also increase this SIP by ~{result.sipIncrease}% annually to keep up with inflation.</small>
                </div>
                <div className="result-card">
                <h3>Invest One-Time (Lumpsum)</h3>
                <p className="amount">₹{result.lumpsum.toLocaleString()}</p>
                <small>This is the amount you would need to invest today in one go.</small>
                </div>
            </div>
            </>
          )}

          {result.yearlyData.length > 0 && (
            <div className="chart-container">
              <h3>📈 Growth Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={result.yearlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="year"
                    label={{ value: "Years", position: "insideBottom", offset: -15, fill: "#666" }}
                    tick={{ fill: "#666", fontSize: 12 }}
                    stroke="#ccc"
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    label={{ value: "Amount (₹)", angle: -90, position: "insideLeft", fill: "#666" }}
                    tick={{ fill: "#666", fontSize: 12 }}
                    stroke="#ccc"
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#475569"
                    fill="url(#colorInvested)"
                    name="Total Invested"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="url(#colorValue)"
                    name="Your Investment Value"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="#eab308"
                    name="Inflation-Adjusted Goal"
                    strokeDasharray="5 5"
                    strokeWidth={3}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .calculator-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .input-section {
            background-color: #f9fafb;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }
        .input-group input, .input-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .input-group input:focus, .input-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        .custom-goal-input {
            margin-top: 10px;
        }
        .input-group-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        .calculate-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .calculate-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .results {
          margin-top: 30px;
        }
        .result-summary {
            text-align: center;
            font-size: 1.1rem;
            color: #444;
            margin-bottom: 20px;
        }
        .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .result-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .result-card-full {
            background: linear-gradient(135deg, #43e97b, #38f9d7);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            color: white;
            font-size: 1.2rem;
        }
        .result-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #333;
        }
        .amount {
          font-size: 2.2rem;
          font-weight: bold;
          margin: 10px 0;
          color: #667eea;
        }
        .amount.gain {
            color: #22c55e;
        }
        .result-card small {
            color: #666;
            font-size: 0.9rem;
        }
        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          margin-top: 20px;
        }
        .chart-container h3 {
            text-align: center;
            margin-bottom: 20px;
        }
        .custom-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #ccc;
          padding: 10px 15px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .custom-tooltip .label {
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
}
