import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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
      (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
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

  return (
    <div className="calculator-container">
      <h2>Goal Investment Calculator</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
        Plan your investments smartly to reach your dream goal 🎯
      </p>

      {/* Goal Type */}
      <div className="input-group">
        <label>Goal Type</label>
        <select
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {goalTypes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {goalType === "Other" && (
          <input
            type="text"
            placeholder="Enter your goal"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            style={{
              marginTop: "8px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />
        )}
      </div>

      {/* Inputs */}
      <div className="input-group">
        <label>Target Amount (₹)</label>
        <input
          type="range"
          min="50000"
          max="10000000"
          step="50000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(Number(e.target.value))}
        />
        <span>₹{targetAmount.toLocaleString()}</span>
      </div>

      <div className="input-group">
        <label>Current Savings (₹)</label>
        <input
          type="range"
          min="0"
          max="5000000"
          step="10000"
          value={currentSavings}
          onChange={(e) => setCurrentSavings(Number(e.target.value))}
        />
        <span>₹{currentSavings.toLocaleString()}</span>
      </div>

      <div className="input-group">
        <label>Time Horizon (Years)</label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(Number(e.target.value))}
        />
        <span>{timeHorizon} years</span>
      </div>

      <div className="input-group">
        <label>Expected Return Rate (%)</label>
        <input
          type="range"
          min="1"
          max="100"
          step="0.5"
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value))}
        />
        <span>{returnRate}%</span>
      </div>

      <div className="input-group">
        <label>Inflation Rate (%)</label>
        <input
          type="range"
          min="1"
          max="100"
          step="0.5"
          value={inflationRate}
          onChange={(e) => setInflationRate(Number(e.target.value))}
        />
        <span>{inflationRate}%</span>
      </div>

      <button onClick={calculateGoal} className="calculate-btn">
        Calculate
      </button>

      {result && (
        <div className="results">
          <div className="result-card">
            <h3>Inflation-Adjusted Goal</h3>
            <p className="amount">₹{result.adjustedGoal.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Monthly SIP Required</h3>
            <p className="amount gain">₹{result.monthlySIP.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Or Lumpsum Today</h3>
            <p className="amount">₹{result.lumpsum.toLocaleString()}</p>
          </div>

          <div className="chart-container">
            {/* LineChart for investment growth */}
            <LineChart
              width={600}
              height={400}
              data={result.yearlyData}
              margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                height={50}
                tick={{ fontSize: 13 }}
                tickMargin={10}
                label={{ value: "Years", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                width={90}
                tickFormatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
              />
              <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#8884d8" name="Invested" />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Investment Value" />
              <Line type="monotone" dataKey="goal" stroke="#ff7300" name="Goal Value" />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
}
