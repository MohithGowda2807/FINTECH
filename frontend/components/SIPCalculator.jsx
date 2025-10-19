import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  const [results, setResults] = useState(null);

  const calculateSIP = () => {
  const P = monthlyInvestment;
  const annualRate = returnRate / 100;
  const n = tenure * 12;

  // Use full precision monthly rate
 const r = annualRate / 12;

  // Future Value calculation
  const futureValue = P * ((Math.pow(1 + r, n) - 1) / r);
  const totalInvested = P * n;
  const wealthGain = futureValue - totalInvested;

  // Year-by-year breakdown
  const yearlyData = [];
  for (let year = 1; year <= tenure; year++) {
    const months = year * 12;
    const yearFV = P * ((Math.pow(1 + r, months) - 1) / r);
    yearlyData.push({
      year: year,
      invested: P * months,
      value: Math.round(yearFV) // Round only for display
    });
  }

  setResults({
    totalInvested: Math.round(totalInvested),
    maturityAmount: Math.round(futureValue),
    wealthGain: Math.round(wealthGain),
    yearlyData: yearlyData
  });
};

  return (
    <div className="calculator-container">
      <h2>SIP Calculator</h2>
      
      <div className="input-group">
        <label>Monthly Investment (₹)</label>
        <input 
          type="range" 
          min="500" 
          max="100000" 
          step="500"
          value={monthlyInvestment}
          onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
        />
        <span>₹{monthlyInvestment.toLocaleString()}</span>
      </div>

      <div className="input-group">
        <label>Expected Annual Return (%)</label>
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
        <label>Investment Tenure (Years)</label>
        <input 
          type="range" 
          min="1" 
          max="40" 
          step="1"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
        />
        <span>{tenure} years</span>
      </div>

      <button onClick={calculateSIP} className="calculate-btn">Calculate</button>

      {results && (
        <div className="results">
          <div className="result-card">
            <h3>Total Invested</h3>
            <p className="amount">₹{results.totalInvested.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Maturity Amount</h3>
            <p className="amount">₹{results.maturityAmount.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Wealth Gain</h3>
            <p className="amount gain">₹{results.wealthGain.toLocaleString()}</p>
          </div>

          <div className="chart-container">
            <LineChart width={600} height={300} data={results.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#06B6D4" name="Invested" strokeWidth={2} />
              <Line type="monotone" dataKey="value" stroke="#0D9488" name="Future Value" strokeWidth={3} />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
}
