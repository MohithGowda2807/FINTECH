import React, { useState } from 'react';

export default function LumpsumCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  const [results, setResults] = useState(null);
  const exemptionLimit = 125000; // ₹1.25 lakh LTCG exemption under current rules

  const calculateLumpsum = () => {
    const P = initialInvestment;
    const r = returnRate / 100;
    const t = tenure;

    const futureValue = P * Math.pow(1 + r, t);
    const totalGain = futureValue - P;

    // Without Tax Harvesting
    const taxableWithout = Math.max(totalGain - exemptionLimit, 0);

    // With Tax Harvesting (realize yearly gains)
    let currentValue = P;
    let totalTaxableGains = 0;

    for (let year = 1; year <= t; year++) {
      const yearEndValue = currentValue * (1 + r);
      const yearlyGain = yearEndValue - currentValue;
      const taxableGain = Math.max(yearlyGain - exemptionLimit, 0);
      totalTaxableGains += taxableGain;
      currentValue = yearEndValue; // reinvest
    }

    setResults({
      futureValue: Math.round(futureValue),
      totalGain: Math.round(totalGain),
      taxableWithout: Math.round(taxableWithout),
      taxableWith: Math.round(totalTaxableGains),
    });
  };

  return (
    <div className="calculator-container">
      <h2>Lumpsum Calculator (Taxable Amount View)</h2>

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
            <h3>Future Value</h3>
            <p className="amount">₹{results.futureValue.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Total Gain</h3>
            <p className="amount">₹{results.totalGain.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Taxable Amount (No Harvesting)</h3>
            <p className="amount">₹{results.taxableWithout.toLocaleString()}</p>
          </div>
          <div className="result-card">
            <h3>Taxable Amount (With Harvesting)</h3>
            <p className="amount">₹{results.taxableWith.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
