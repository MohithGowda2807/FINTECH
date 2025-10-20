import React, { useState } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function SIPTaxHarvestingCalculator() {
  const [inputs, setInputs] = useState({
    monthlyInvestment: 5000,
    returnRate: 12,
    tenure: 10
  });

  const [results, setResults] = useState(null);

  const calculate = () => {
    const P = Number(inputs.monthlyInvestment);
    const annualRate = Number(inputs.returnRate) / 100;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const years = Number(inputs.tenure);
    const n = years * 12;

    // Groww SIP formula for overall value (without harvesting)
    const FV_normal = P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = P * n;
    const totalGain = FV_normal - totalInvested;

    // Tax harvesting simulation
    let balance = 0;
    let invested = 0;
    let yearlyData = [];
    let shortTermTaxable = 0;

    for (let year = 1; year <= years; year++) {
      // SIP investment for each month
      for (let m = 1; m <= 12; m++) {
        balance = balance * (1 + monthlyRate) + P;
        invested += P;
      }

      // Simulate 1-year holding before harvesting
      balance *= Math.pow(1 + monthlyRate, 12);

      const gain = balance - invested;

      // Final year = short-term taxable
      if (year === years) shortTermTaxable = gain;

      yearlyData.push({
        year,
        invested: Math.round(invested),
        value: Math.round(balance),
        gain: Math.round(gain),
        taxableShort: year === years ? Math.round(gain) : 0,
      });
    }

    // Without harvesting, all gain becomes taxable at the end
    const longTermTaxableWithout = totalGain;

    // With harvesting, almost all long-term tax is avoided
    const longTermTaxableWith = longTermTaxableWithout * 0.05; // assume 95% tax saved via harvesting

    setResults({
      totalInvested: Math.round(totalInvested),
      FV_normal: Math.round(FV_normal),
      FV_harvested: Math.round(balance),
      totalGain: Math.round(totalGain),
      shortTermTaxable: Math.round(shortTermTaxable),
      longTermTaxableWith: Math.round(longTermTaxableWith),
      longTermTaxableWithout: Math.round(longTermTaxableWithout),
      yearlyData
    });
  };

  return (
    <div className="calculator-container">
      <h2>💹 SIP Tax Harvesting Calculator</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Understand how tax harvesting can reduce taxable capital gains in long-term SIP investments
      </p>

      {/* How Tax Harvesting Works */}
      <div className="info-box">
        <h3>🧾 How SIP Tax Harvesting Works</h3>
        <ul>
          <li>You continue your SIP investment every month as usual.</li>
          <li>Each year, profits from earlier SIP units are redeemed and reinvested — this resets their purchase date.</li>
          <li>This ensures that those gains qualify as long-term (held for 1+ years), making them tax-free up to the LTCG exemption limit.</li>
          <li>Only the last year’s gains remain short-term, since they haven’t completed 1 year of holding.</li>
          <li>This strategy can significantly reduce overall tax liability without changing your SIP habit.</li>
        </ul>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label>Monthly SIP (₹)</label>
          <input
            type="number"
            value={inputs.monthlyInvestment}
            onChange={(e) => setInputs({ ...inputs, monthlyInvestment: e.target.value })}
          />
          <small>Fixed monthly contribution</small>
        </div>

        <div className="input-group">
          <label>Expected Annual Return (%)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({ ...inputs, returnRate: e.target.value })}
          />
          <small>Average annual growth rate</small>
        </div>

        <div className="input-group">
          <label>Investment Duration (Years)</label>
          <input
            type="number"
            value={inputs.tenure}
            onChange={(e) => setInputs({ ...inputs, tenure: e.target.value })}
          />
          <small>Total investment period</small>
        </div>

        <button onClick={calculate} className="calculate-btn">
          Calculate
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <h4>Total Invested</h4>
              <p className="result-value">₹{results.totalInvested.toLocaleString()}</p>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>
              <h4>Total Value</h4>
              <p className="result-value">₹{results.FV_harvested.toLocaleString()}</p>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg,#fa709a,#fee140)' }}>
              <h4>Total Gain</h4>
              <p className="result-value">₹{results.totalGain.toLocaleString()}</p>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg,#30cfd0,#330867)' }}>
              <h4>Short-Term Taxable (Final Year)</h4>
              <p className="result-value">₹{results.shortTermTaxable.toLocaleString()}</p>
              <small>Only last year's gains are short-term taxable</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
              <h4>Long-Term Taxable (Without Harvesting)</h4>
              <p className="result-value">₹{results.longTermTaxableWithout.toLocaleString()}</p>
              <small>If you never harvested profits</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>
              <h4>Long-Term Taxable (With Harvesting)</h4>
              <p className="result-value">₹{results.longTermTaxableWith.toLocaleString()}</p>
              <small>After applying annual tax harvesting</small>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-section">
            <h3>📊 Growth Projection - Year by Year</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                {/* THIS IS THE FIX: The string must be wrapped in backticks ` ` */}
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" stroke="#8884d8" strokeWidth={2} name="Invested" />
                <Line type="monotone" dataKey="value" stroke="#43e97b" strokeWidth={3} name="Future Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="table-section">
            <h3>📅 Year-by-Year Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Invested</th>
                  <th>Value</th>
                  <th>Gain</th>
                  <th>Short-Term Taxable</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>₹{row.invested.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{row.value.toLocaleString()}</td>
                    <td>₹{row.gain.toLocaleString()}</td>
                    <td style={{ color: row.taxableShort > 0 ? '#ef4444' : '#999' }}>
                      {row.taxableShort > 0 ? `₹${row.taxableShort.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .info-box {
          background: #f8fafc;
          border-left: 5px solid #667eea;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
        }
        .info-box h3 { margin-bottom: 10px; color: #333; }
        .info-box ul { margin-left: 20px; color: #555; }
        .info-box li { margin-bottom: 8px; }

        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        .input-group input {
          width: 100%; padding: 12px; border: 2px solid #e0e0e0;
          border-radius: 8px; font-size: 16px;
        }
        .input-group small { color: #666; font-size: 13px; }

        .calculate-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: white; border: none; border-radius: 10px;
          font-size: 18px; font-weight: 600; cursor: pointer;
          margin-top: 15px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .result-card {
          padding: 25px; border-radius: 15px; color: white; text-align: center;
        }
        .result-value { font-size: 26px; font-weight: bold; margin-top: 10px; }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; }
        th { background: #667eea; color: white; font-weight: 600; }
      `}</style>
    </div>
  );
}
