import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

    const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
    const months = t * 12;
    const monthlySIP =
      amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    const lumpsum = amountNeeded / Math.pow(1 + r, t);

    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const m = year * 12;
      const sipValue =
        monthlySIP *
          ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
          (1 + monthlyRate);
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
    });
  };

  const getSliderStyle = (value, max) => ({
    background: `linear-gradient(to right, #4f46e5 ${(value / max) * 100}%, #d1d5db ${(value / max) * 100}%)`,
  });

  const handleRangeInput = (setter) => (e) => setter(Number(e.target.value));
  const handleTextInput = (setter) => (e) => setter(Number(e.target.value) || 0);

  return (
    <div className="calculator-wrapper">
      <div className="calculator-card">
        <h1 className="title">🎯 Goal-Based Investment Planner</h1>
        <p className="subtitle">
          Plan your financial goals with smart investment strategies
        </p>

        {/* Goal Type */}
        <div className="form-group">
          <label>Goal Type</label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="dropdown"
          >
            {goalTypes.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>

          {goalType === "Other" && (
            <input
              type="text"
              placeholder="Enter your goal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="text-input"
            />
          )}
        </div>

        {/* Input Sliders */}
        {[
          { label: "Target Amount (₹)", val: targetAmount, min: 50000, max: 10000000, step: 50000, setter: setTargetAmount },
          { label: "Current Savings (₹)", val: currentSavings, min: 0, max: 5000000, step: 10000, setter: setCurrentSavings },
          { label: "Time Horizon (Years)", val: timeHorizon, min: 1, max: 30, step: 1, setter: setTimeHorizon },
          { label: "Expected Return Rate (%)", val: returnRate, min: 1, max: 30, step: 0.5, setter: setReturnRate },
          { label: "Inflation Rate (%)", val: inflationRate, min: 2, max: 15, step: 0.5, setter: setInflationRate },
        ].map((f, i) => (
          <div key={i} className="form-group">
            <label>{f.label}</label>
            <div className="slider-row">
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={f.val}
                onChange={handleRangeInput(f.setter)}
                style={getSliderStyle(f.val, f.max)}
              />
              <input
                type="number"
                min={f.min}
                max={f.max}
                step={f.step}
                value={f.val}
                onChange={handleTextInput(f.setter)}
                className="number-input"
              />
            </div>
          </div>
        ))}

        <button className="calculate-btn" onClick={calculateGoal}>
          Calculate My Goal 🚀
        </button>

        {result && (
          <div className="results">
            <div className="cards">
              <div className="card">
                <h3>Inflation-Adjusted Goal</h3>
                <p>₹{result.adjustedGoal.toLocaleString("en-IN")}</p>
              </div>
              <div className="card highlight">
                <h3>Monthly SIP Required</h3>
                <p>₹{result.monthlySIP.toLocaleString("en-IN")}</p>
              </div>
              <div className="card">
                <h3>Or Lumpsum Today</h3>
                <p>₹{result.lumpsum.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="ai-tip">
              <h4>🤖 AI Investment Tip:</h4>
              <p>
                Increase your SIP by <strong>{result.sipIncrease}%</strong>{" "}
                annually to reach your "<strong>{getFinalGoalType()}</strong>"
                goal faster and beat inflation.
              </p>
            </div>

            <div className="chart-section">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={result.yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="invested"
                    stroke="#6366f1"
                    name="Invested"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    name="Your Investment"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="#eab308"
                    name="Goal Value"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .calculator-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #e0f2fe, #eef2ff);
          min-height: 100vh;
          padding: 30px;
        }
        .calculator-card {
          background: white;
          max-width: 700px;
          width: 100%;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }
        .title {
          text-align: center;
          font-size: 28px;
          color: #334155;
          margin-bottom: 8px;
        }
        .subtitle {
          text-align: center;
          color: #64748b;
          margin-bottom: 25px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 8px;
        }
        .dropdown, .text-input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          outline: none;
          font-size: 15px;
        }
        .slider-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        input[type="range"] {
          flex: 1;
          height: 8px;
          border-radius: 10px;
          cursor: pointer;
        }
        .number-input {
          width: 100px;
          padding: 6px 10px;
          text-align: right;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
        }
        .calculate-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 14px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calculate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
        }
        .results {
          margin-top: 30px;
        }
        .cards {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .card {
          flex: 1;
          min-width: 180px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .card.highlight {
          background: #eef2ff;
          border: 1.5px solid #6366f1;
        }
        .card h3 {
          font-size: 15px;
          color: #475569;
        }
        .card p {
          font-size: 20px;
          font-weight: bold;
          color: #111827;
          margin-top: 8px;
        }
        .ai-tip {
          margin-top: 25px;
          background: #ecfeff;
          padding: 15px;
          border-radius: 10px;
          border-left: 5px solid #0ea5e9;
        }
        .ai-tip h4 {
          margin-bottom: 5px;
          color: #0f172a;
        }
        .chart-section {
          margin-top: 25px;
          height: 320px;
        }
        @media (max-width: 768px) {
          .calculator-card { padding: 20px; }
          .cards { flex-direction: column; }
          .chart-section { height: 250px; }
        }
      `}</style>
    </div>
  );
}
