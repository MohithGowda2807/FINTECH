import React, 'useState' from 'react';

export default function LumpsumCalculator() {
  const [inputs, setInputs] = useState({
    initialInvestment: 100000,
    returnRate: 12,
    tenure: 21,
  });

  const [results, setResults] = useState(null);
  const exemptionLimit = 125000; // ₹1.25 lakh LTCG exemption

  const calculate = () => {
    const P = Number(inputs.initialInvestment);
    const r = Number(inputs.returnRate) / 100;
    const t = Number(inputs.tenure);

    // Standard Groww formula (annual compounding)
    const futureValue = P * Math.pow(1 + r, t);
    const totalGain = futureValue - P;

    // Without Tax Harvesting
    const taxableWithout = Math.max(totalGain - exemptionLimit, 0);

    // With Tax Harvesting (reset each year)
    let currentValue = P;
    let totalTaxableGains = 0;
    for (let year = 1; year <= t; year++) {
      const yearEndValue = currentValue * (1 + r);
      const yearlyGain = yearEndValue - currentValue;
      const taxableGain = Math.max(yearlyGain - exemptionLimit, 0);
      totalTaxableGains += taxableGain;
      currentValue = yearEndValue;
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
      <h2>💰 Lumpsum Calculator (Groww Accurate)</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Calculate your future value and understand the benefits of tax harvesting
      </p>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label>Initial Investment (₹)</label>
          <input
            type="number"
            value={inputs.initialInvestment}
            onChange={(e) => setInputs({ ...inputs, initialInvestment: e.target.value })}
            placeholder="100000"
          />
          <small>One-time investment amount</small>
        </div>

        <div className="input-group">
          <label>Expected Return Rate (%)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({ ...inputs, returnRate: e.target.value })}
            placeholder="12"
            step="0.5"
          />
          <small>Average annual growth rate (CAGR)</small>
        </div>

        <div className="input-group">
          <label>Investment Duration (Years)</label>
          <input
            type="number"
            value={inputs.tenure}
            onChange={(e) => setInputs({ ...inputs, tenure: e.target.value })}
            placeholder="21"
            min="1"
            max="40"
          />
          <small>Total investment period (1–40 years)</small>
        </div>

        <button onClick={calculate} className="calculate-btn">
          Calculate Returns
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <h4>Future Value</h4>
              <p className="result-value">₹{results.futureValue.toLocaleString()}</p>
              <small>Total maturity amount</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <h4>Total Gain</h4>
              <p className="result-value">₹{results.totalGain.toLocaleString()}</p>
              <small>Total profit earned</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h4>Taxable (No Harvesting)</h4>
              <p className="result-value">₹{results.taxableWithout.toLocaleString()}</p>
              <small>If gains are realized at end of term</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
              <h4>Taxable (With Harvesting)</h4>
              <p className="result-value">₹{results.taxableWith.toLocaleString()}</p>
              <small>Using annual tax harvesting strategy</small>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="info-section">
            <h3>🧾 Understanding Tax Harvesting</h3>
            <ul>
              <li>
                <strong>Tax harvesting</strong> means selling mutual fund units each year to book profits up to the ₹1.25 lakh
                LTCG exemption limit.
              </li>
              <li>
                After booking profits, you can reinvest the same amount — effectively resetting the cost price for the next year.
              </li>
              <li>
                This ensures that each year’s capital gain stays below the exemption limit, minimizing or eliminating long-term capital gains tax.
              </li>
              <li>
                Over a long tenure, tax harvesting can lead to <strong>significant tax savings</strong> and higher effective post-tax returns.
              </li>
              <li>
                It’s best suited for <strong>long-term equity mutual funds</strong> where LTCG tax (10%) applies beyond ₹1.25 lakh gains per year.
              </li>
            </ul>
          </div>
        </>
      )}

      <style jsx>{`
        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }

        .input-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }

        .input-group small {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 13px;
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
          margin-top: 20px;
        }

        .calculate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .result-card {
          padding: 25px;
          border-radius: 15px;
          color: white;
          text-align: center;
        }

        .result-card h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          opacity: 0.9;
        }

        .result-value {
          font-size: 28px;
          font-weight: bold;
          margin: 10px 0;
        }

        .info-section {
          background: #f9fafb;
          border-radius: 15px;
          padding: 25px;
          margin-top: 40px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .info-section h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .info-section ul {
          list-style-type: disc;
          padding-left: 20px;
          color: #444;
          line-height: 1.6;
        }

        .info-section li {
          margin-bottom: 10px;
        }

        .info-section strong {
          color: #111;
        }
      `}</style>
    </div>
  );
}
