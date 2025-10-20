import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function GoalCalculator() {
  const [goalType, setGoalType] = useState('Buying a Car');
  const [customGoal, setCustomGoal] = useState('');
  const [targetAmount, setTargetAmount] = useState(800000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [returnRate, setReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [result, setResult] = useState(null);

  const goalTypes = [
    'Buying a Car',
    'Purchasing a Laptop/Gadget',
    'Planning a Foreign Trip',
    'Building Emergency Fund',
    'House Down Payment',
    'Dream Watch/Jewelry',
    'Wedding',
    'Education',
    'Other'
  ];

  const getFinalGoalType = () => (goalType === 'Other' ? customGoal || 'Custom Goal' : goalType);

  const calculateGoal = () => {
    const r = returnRate / 100;
    const i = inflationRate / 100;
    const t = timeHorizon;

    // Inflation-adjusted goal
    const adjustedGoal = targetAmount * Math.pow(1 + i, t);
    const futureCurrentSavings = currentSavings * Math.pow(1 + r, t);
    const amountNeeded = adjustedGoal - futureCurrentSavings;

    // Monthly SIP
    const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
    const months = t * 12;
    const monthlySIP = amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

    // Lumpsum
    const lumpsum = amountNeeded / Math.pow(1 + r, t);

    // Chart Data
    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const m = year * 12;
      const sipValue = monthlySIP * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
      const savingsValue = currentSavings * Math.pow(1 + r, year);
      const goalValue = targetAmount * Math.pow(1 + i, year);
      yearlyData.push({
        year: year,
        invested: Math.round(monthlySIP * m + currentSavings),
        value: Math.round(sipValue + savingsValue),
        goal: Math.round(goalValue)
      });
    }

    const sipIncrease = Math.round(inflationRate / 2);
    setResult({
      adjustedGoal: Math.round(adjustedGoal),
      monthlySIP: Math.round(monthlySIP),
      lumpsum: Math.round(lumpsum),
      totalInvested: Math.round(monthlySIP * months + currentSavings),
      sipIncrease,
      yearlyData
    });
  };

  const getSliderStyle = (value, max) => ({
    background: `linear-gradient(to right, #3b82f6 ${(value / max) * 100}%, #d1d5db ${(value / max) * 100}%)`
  });

  const handleRangeInput = (setter) => (e) => setter(Number(e.target.value));
  const handleTextInput = (setter) => (e) => setter(Number(e.target.value) || 0);

  return (
    <div className="calculator-container">
      <h2>🎯 Goal-Based Investment Planner</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Plan your financial goals with smart investment strategies
      </p>

      {/* Goal Type Dropdown */}
      <div className="input-group">
        <label>Goal Type</label>
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          {goalTypes.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
        {goalType === 'Other' && (
          <input
            type="text"
            placeholder="Enter your goal"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '8px',
              border: '1.5px solid #ccc'
            }}
          />
        )}
      </div>

      {/* Fields with Sliders + Input Boxes */}
      {[
        { label: 'Target Amount (₹)', val: targetAmount, min: 50000, max: 10000000, step: 50000, setter: setTargetAmount },
        { label: 'Current Savings (₹)', val: currentSavings, min: 0, max: 5000000, step: 10000, setter: setCurrentSavings },
        { label: 'Time Horizon (Years)', val: timeHorizon, min: 1, max: 30, step: 1, setter: setTimeHorizon },
        { label: 'Expected Return Rate (%)', val: returnRate, min: 1, max: 30, step: 0.5, setter: setReturnRate },
        { label: 'Inflation Rate (%)', val: inflationRate, min: 2, max: 15, step: 0.5, setter: setInflationRate }
      ].map((f, i) => (
        <div key={i} className="input-group">
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

      <button onClick={calculateGoal} className="calculate-btn">Calculate My Goal 🚀</button>

      {result && (
        <div className="results">
          <div className="result-card">
            <h3>Inflation-Adjusted Goal</h3>
            <p className="amount">₹{result.adjustedGoal.toLocaleString('en-IN')}</p>
          </div>
          <div className="result-card">
            <h3>Monthly SIP Required</h3>
            <p className="amount gain">₹{result.monthlySIP.toLocaleString('en-IN')}</p>
          </div>
          <div className="result-card">
            <h3>Or Lumpsum Today</h3>
            <p className="amount">₹{result.lumpsum.toLocaleString('en-IN')}</p>
          </div>

          <div className="ai-tip">
            <h4>🤖 AI Investment Tip:</h4>
            <p>
              Increase your SIP by <strong>{result.sipIncrease}%</strong> annually 
              to reach your "{getFinalGoalType()}" goal faster and beat inflation.
            </p>
          </div>

          <div className="chart-container">
            <LineChart width={600} height={300} data={result.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#475569" name="Invested" strokeWidth={2} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" name="Your Investment" strokeWidth={3} />
              <Line type="monotone" dataKey="goal" stroke="#D4AF37" name="Goal Value" strokeWidth={3} strokeDasharray="5 5" />
            </LineChart>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider-row { display: flex; align-items: center; gap: 10px; }
        input[type='range'] {
          width: 100%;
          height: 8px;
          border-radius: 12px;
          outline: none;
          appearance: none;
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .number-input {
          width: 100px;
          text-align: right;
          padding: 6px 10px;
          border: 1.5px solid #ccc;
          border-radius: 8px;
        }
        .calculate-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          padding: 15px;
          border-radius: 12px;
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-top: 20px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .calculate-btn:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
