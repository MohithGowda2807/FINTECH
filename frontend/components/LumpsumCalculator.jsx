import React, { useState } from 'react';

export default function LumpsumCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  const [results, setResults] = useState(null);

  const calculateLumpsum = () => {
    const P = initialInvestment;
    const r = returnRate / 100;
    const t = tenure;
    // FV = P × (1 + r)^t
    const futureValue = P * Math.pow(1 + r, t);
    const wealthGain = futureValue - P;
    setResults({
      futureValue: Math.round(futureValue),
      wealthGain: Math.round(wealthGain),
      cagr: returnRate
    });
  };

  return (
    <div className="glassCard calculator-container">
      <h2 style={{ marginBottom: '2rem', fontWeight: 700, fontSize: '2.4rem', letterSpacing: '1px', textShadow: '0 4px 32px #37eaca55' }}>
        <span className="brand-gradient">Lumpsum Calculator</span>
      </h2>
      
      <div className="input-group">
        <label>Initial Investment (₹)</label>
        <input
          type="range"
          min="10000"
          max="10000000"
          step="10000"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(Number(e.target.value))}
        />
        <span style={{ color: '#37eaca', fontWeight: 600, fontSize: '1.11rem' }}>
          ₹{initialInvestment.toLocaleString()}
        </span>
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
        <span style={{ color: '#47e3be', fontWeight: 600 }}>{returnRate}%</span>
      </div>

      <div className="input-group">
        <label>Tenure (Years)</label>
        <input
          type="range"
          min="1"
          max="40"
          step="1"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
        />
        <span style={{ color: '#7f8cff', fontWeight: 600 }}>{tenure} years</span>
      </div>

      <button onClick={calculateLumpsum} className="calculate-btn" style={{
        fontWeight: 700,
        fontSize: '1.13rem',
        marginTop: '1.2rem',
        boxShadow: '0 8px 32px 0 rgba(48,152,238,0.09)'
      }}>Calculate</button>

      {results && (
        <div className="results" style={{ marginTop: '2.5rem' }}>
          <div className="result-card">
            <h3>Initial Investment</h3>
            <p className="amount">₹{initialInvestment.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Future Value</h3>
            <p className="amount">₹{results.futureValue.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Wealth Gain</h3>
            <p className="amount gain">₹{results.wealthGain.toLocaleString()}</p>
          </div>
        </div>
      )}
      {/* Neo-Finance shadow */}
      <style jsx>{`
        .input-group label {
          color: #47e3be;
        }
        span {
          display: inline-block;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
