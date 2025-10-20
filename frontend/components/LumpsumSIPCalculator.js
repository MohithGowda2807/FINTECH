import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LumpsumSIPCalculator() {
  const [inputs, setInputs] = useState({
    lumpsum: 100000,
    monthlySIP: 5000,
    returnRate: 12,
    tenure: 10
  });

  const [results, setResults] = useState(null);

  const calculate = () => {
    const L = Number(inputs.lumpsum);
    const S = Number(inputs.monthlySIP);
    const r = Math.pow(1 + Number(inputs.returnRate) / 100, 1 / 12) - 1;
    const t = Number(inputs.tenure);
    const n = t * 12;

    // Future Value of Lumpsum
    const FV_Lumpsum = L * Math.pow(1 + r, n);

    // Future Value of SIP
    const FV_SIP = S * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

    const totalFutureValue = FV_Lumpsum + FV_SIP;
    const totalInvested = L + S * 12 * t;
    const totalGain = totalFutureValue - totalInvested;

    // Tax Harvesting Logic
    const exemptionLimit = 125000; // ₹1.25 lakh LTCG exemption
    let balance = 0;
    let invested = 0;
    let yearlyData = [];
    let totalTaxableLongWithout = 0;
    let totalTaxableLongWith = 0;
    let shortTermTaxable = 0;

    for (let year = 1; year <= t; year++) {
      for (let m = 1; m <= 12; m++) {
        balance = balance * (1 + r) + S;
        invested += S;
      }

      const lumpsumValue = L * Math.pow(1 + r, year * 12);
      const totalValue = lumpsumValue + balance;
      const gain = totalValue - (L + invested);

      // Without Harvesting - all gain taxable at end
      if (year === t) totalTaxableLongWithout = gain;

      // With Harvesting - yearly reset of tax-free units
      const yearlyGain = totalValue - (L + invested);
      const taxableGain = Math.max(yearlyGain - exemptionLimit, 0);
      totalTaxableLongWith += taxableGain;

      // Final year = short-term taxable (since unharvested)
      if (year === t) shortTermTaxable = taxableGain;

      yearlyData.push({
        year,
        invested: Math.round(L + invested),
        lumpsumValue: Math.round(lumpsumValue),
        sipValue: Math.round(balance),
        totalValue: Math.round(totalValue),
        gain: Math.round(gain)
      });
    }

    setResults({
      totalInvested: Math.round(totalInvested),
      FV_Lumpsum: Math.round(FV_Lumpsum),
      FV_SIP: Math.round(FV_SIP),
      totalFutureValue: Math.round(totalFutureValue),
      totalGain: Math.round(totalGain),
      shortTermTaxable: Math.round(shortTermTaxable),
      longTermTaxableWith: Math.round(totalTaxableLongWith),
      longTermTaxableWithout: Math.round(totalTaxableLongWithout),
      yearlyData
    });
  };

  return (
    <div className="calculator-container">
      <h2>💰 Lumpsum + SIP Calculator (with Tax Harvesting)</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Calculate combined returns from one-time lumpsum and regular SIP investments — now with tax harvesting insights
      </p>

      {/* Tax Harvesting Explanation */}
      <div style={{
        background: '#f8fafc',
        borderLeft: '5px solid #667eea',
        padding: '15px 20px',
        borderRadius: '10px',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#333' }}>🧾 How Tax Harvesting Works</h3>
        <ul style={{ color: '#555', marginLeft: '20px' }}>
          <li>Each year, profits are redeemed and reinvested to reset the holding period.</li>
          <li>This allows earlier gains to become long-term and stay within the ₹1.25L LTCG exemption limit.</li>
          <li>Only the last year’s gains remain short-term and taxable.</li>
          <li>Helps reduce overall taxable gains significantly while keeping investment continuity.</li>
          <li>Applies seamlessly to both lumpsum and SIP parts of your portfolio.</li>
        </ul>
      </div>

      {/* Input Form */}
      <div className="input-section">
        <div className="input-group">
          <label>Lumpsum Investment (₹)</label>
          <input
            type="number"
            value={inputs.lumpsum}
            onChange={(e) => setInputs({ ...inputs, lumpsum: e.target.value })}
          />
          <small>One-time investment amount</small>
        </div>

        <div className="input-group">
          <label>Monthly SIP (₹)</label>
          <input
            type="number"
            value={inputs.monthlySIP}
            onChange={(e) => setInputs({ ...inputs, monthlySIP: e.target.value })}
          />
          <small>Fixed monthly contribution</small>
        </div>

        <div className="input-group">
          <label>Expected Annual Return (%)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({ ...inputs, returnRate: e.target.value })}
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
            min="1"
            max="40"
          />
          <small>Total investment period (1-40 years)</small>
        </div>

        <button onClick={calculate} className="calculate-btn">Calculate Returns</button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <h4>Total Invested</h4>
              <p className="result-value">₹{results.totalInvested.toLocaleString()}</p>
              <small>Lumpsum + Total SIP</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
              <h4>Total Future Value</h4>
              <p className="result-value">₹{results.totalFutureValue.toLocaleString()}</p>
              <small>Combined maturity value</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)' }}>
              <h4>Total Gain</h4>
              <p className="result-value">₹{results.totalGain.toLocaleString()}</p>
              <small>Total profit earned</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #30cfd0, #330867)' }}>
              <h4>Short-Term Taxable</h4>
              <p className="result-value">₹{results.shortTermTaxable.toLocaleString()}</p>
              <small>Final year's gain (short-term)</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <h4>Long-Term Taxable (Without Harvesting)</h4>
              <p className="result-value">₹{results.longTermTaxableWithout.toLocaleString()}</p>
              <small>If profits were never harvested</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
              <h4>Long-Term Taxable (With Harvesting)</h4>
              <p className="result-value">₹{results.longTermTaxableWith.toLocaleString()}</p>
              <small>After annual tax harvesting</small>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-section">
            <h3>📈 Growth Projection - Year by Year</h3>
            <ResponsiveContainer width="100%" height={400}
             margin={{ top: 20, right: 40, left: 80, bottom: 20 }}>
              <LineChart data={results.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                {/* THIS IS THE FIX: Added backticks ` ` */}
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" stroke="#8884d8" strokeWidth={2} name="Invested" />
                <Line type="monotone" dataKey="lumpsumValue" stroke="#f5576c" strokeWidth={2} name="Lumpsum Value" />
                <Line type="monotone" dataKey="sipValue" stroke="#4facfe" strokeWidth={2} name="SIP Value" />
                <Line type="monotone" dataKey="totalValue" stroke="#43e97b" strokeWidth={3} name="Total Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Table */}
          <div className="table-section">
            <h3>📅 Year-by-Year Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Invested</th>
                  <th>Lumpsum Value</th>
                  <th>SIP Value</th>
                  <th>Total Value</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>₹{row.invested.toLocaleString()}</td>
                    <td>₹{row.lumpsumValue.toLocaleString()}</td>
                    <td>₹{row.sipValue.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{row.totalValue.toLocaleString()}</td>
                    <td style={{ color: '#10b981' }}>₹{row.gain.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Existing Styles */}
      <style jsx>{`
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        .input-group input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; }
        .input-group small { color: #666; font-size: 13px; }
        .calculate-btn {
          width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2);
          color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: 600; cursor: pointer; margin-top: 20px;
        }
        .calculate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .result-card { padding: 25px; border-radius: 15px; color: white; text-align: center; }
        .result-value { font-size: 28px; font-weight: bold; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; }
        th { background: #667eea; color: white; font-weight: 600; }
        tr:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
}
