import React, { useState } from 'react';

export default function LumpsumCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  const [taxHarvesting, setTaxHarvesting] = useState(false);
  const [results, setResults] = useState(null);

  const LTCG_EXEMPTION = 125000; // 1.25 lakh exemption

  const calculateLumpsum = () => {
    const P = initialInvestment;
    const r = returnRate / 100;
    const t = tenure;

    // FV = P × (1 + r)^t
    const futureValue = P * Math.pow(1 + r, t);
    const wealthGain = futureValue - P;

    // "Without" tax harvesting: single redemption at end
    const taxableWithout = Math.max(0, wealthGain - LTCG_EXEMPTION);

    // "With" tax harvesting: assume yearly redemption of gains,
    // each year up to 1.25 lakh exempt (approximate logic)
    let cumulativePrincipal = P;
    let totalTaxableWith = 0;
    let lastFV = P;

    for (let year = 1; year <= t; year++) {
      // Value at this year
      const currFV = P * Math.pow(1 + r, year);
      const annualGain = currFV - lastFV;

      // Each year's gain above exemption is taxable
      const taxableThisYear = Math.max(0, annualGain - LTCG_EXEMPTION);
      totalTaxableWith += taxableThisYear;

      lastFV = currFV;
    }

    setResults({
      futureValue: Math.round(futureValue),
      wealthGain: Math.round(wealthGain),
      taxableWithout: Math.round(taxableWithout),
      taxableWith: Math.round(totalTaxableWith)
    });
  };

  return (
    <div className="calculator-container">
      <h2>Lumpsum Calculator</h2>
      
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
        <span>₹{initialInvestment.toLocaleString()}</span>
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
        <label>Tenure (Years)</label>
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

      <button onClick={calculateLumpsum} className="calculate-btn">Calculate</button>

      {results && (
        <div className="results">
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
    </div>
  );
}
