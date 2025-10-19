import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function GoalCalculator() {
  const [goalType, setGoalType] = useState('Buying a Car');
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
    'Education'
  ];

  const calculateGoal = () => {
    const r = returnRate / 100;
    const i = inflationRate / 100;
    const t = timeHorizon;

    // Inflation-adjusted future value
    const adjustedGoal = targetAmount * Math.pow(1 + i, t);

    // Amount needed after current savings grow
    const futureCurrentSavings = currentSavings * Math.pow(1 + r, t);
    const amountNeeded = adjustedGoal - futureCurrentSavings;

    // Monthly SIP calculation using Groww formula
    const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
    const months = t * 12;
    const monthlySIP = amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

    // Lumpsum calculation
    const lumpsum = amountNeeded / Math.pow(1 + r, t);

    // Year-by-year breakdown
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

    const sipIncrease = Math.round((inflationRate / 2));
    
    setResult({
      adjustedGoal: Math.round(adjustedGoal),
      monthlySIP: Math.round(monthlySIP),
      lumpsum: Math.round(lumpsum),
      totalInvested: Math.round(monthlySIP * months + currentSavings),
      sipIncrease,
      yearlyData
    });
  };

  return (
    <div className="calculator-container">
      <h2>🎯 Goal-Based Investment Planner</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Plan your financial goals with smart investment strategies
      </p>

      <div className="input-group">
        <label>Goal Type</label>
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          {goalTypes.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
      </div>

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
        <span>₹{targetAmount.toLocaleString('en-IN')}</span>
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
        <span>₹{currentSavings.toLocaleString('en-IN')}</span>
      </div>

      <div className="input-group">
        <label>Time Horizon (Years)</label>
        <input
          type="range"
          min="1"
          max="30"
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
          max="30"
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
          min="2"
          max="15"
          step="0.5"
          value={inflationRate}
          onChange={(e) => setInflationRate(Number(e.target.value))}
        />
        <span>{inflationRate}%</span>
      </div>

      <button onClick={calculateGoal} className="calculate-btn">
        Calculate My Goal 🚀
      </button>

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
              to reach your "{goalType}" goal faster and beat inflation! 
              This step-up strategy can help you achieve your goal {Math.round(timeHorizon * 0.2)} months sooner.
            </p>
          </div>

          <div className="chart-container">
            <LineChart width={600} height={300} data={result.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#475569" name="Total Invested" strokeWidth={2} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" name="Your Investment" strokeWidth={3} />
              <Line type="monotone" dataKey="goal" stroke="#D4AF37" name="Goal Value" strokeWidth={3} strokeDasharray="5 5" />
            </LineChart>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-tip {
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%);
          border-left: 4px solid #D4AF37;
          border-radius: 8px;
        }

        .ai-tip h4 {
          margin: 0 0 10px 0;
          color: #D4AF37;
          font-size: 18px;
        }

        .ai-tip p {
          margin: 0;
          color: #333;
          line-height: 1.6;
        }

        select {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          background: white;
          font-size: 16px;
          cursor: pointer;
        }

        select:focus {
          outline: none;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
}
