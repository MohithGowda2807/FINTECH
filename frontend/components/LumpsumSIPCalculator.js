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
    const r = Number(inputs.returnRate) / 100 / 12; // Monthly rate
    const t = Number(inputs.tenure);
    const n = t * 12; // Total months

    // Future Value of Lumpsum
    const FV_Lumpsum = L * Math.pow(1 + r, n);

    // Future Value of SIP
    const FV_SIP = S * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

    // Total values
    const totalInvested = L + (S * 12 * t);
    const totalFutureValue = FV_Lumpsum + FV_SIP;
    const totalGain = totalFutureValue - totalInvested;

    // Year-by-year breakdown
    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const months = year * 12;
      const lumpsumValue = L * Math.pow(1 + r, months);
      const sipValue = S * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
      
      yearlyData.push({
        year: year,
        invested: L + (S * 12 * year),
        lumpsumValue: Math.round(lumpsumValue),
        sipValue: Math.round(sipValue),
        totalValue: Math.round(lumpsumValue + sipValue)
      });
    }

    setResults({
      totalInvested: Math.round(totalInvested),
      FV_Lumpsum: Math.round(FV_Lumpsum),
      FV_SIP: Math.round(FV_SIP),
      totalFutureValue: Math.round(totalFutureValue),
      totalGain: Math.round(totalGain),
      yearlyData
    });
  };

  return (
    <div className="calculator-container">
      <h2>💰 Lumpsum + SIP Calculator</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
        Calculate combined returns from one-time lumpsum and regular SIP investments
      </p>

      {/* Input Form */}
      <div className="input-section">
        <div className="input-group">
          <label>Lumpsum Investment (₹)</label>
          <input
            type="number"
            value={inputs.lumpsum}
            onChange={(e) => setInputs({...inputs, lumpsum: e.target.value})}
            placeholder="100000"
          />
          <small>One-time investment amount</small>
        </div>

        <div className="input-group">
          <label>Monthly SIP (₹)</label>
          <input
            type="number"
            value={inputs.monthlySIP}
            onChange={(e) => setInputs({...inputs, monthlySIP: e.target.value})}
            placeholder="5000"
          />
          <small>Fixed monthly contribution</small>
        </div>

        <div className="input-group">
          <label>Expected Annual Return (%)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({...inputs, returnRate: e.target.value})}
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
            onChange={(e) => setInputs({...inputs, tenure: e.target.value})}
            placeholder="10"
            min="1"
            max="40"
          />
          <small>Total investment period (1-40 years)</small>
        </div>

        <button onClick={calculate} className="calculate-btn">
          Calculate Returns
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h4>Total Invested</h4>
              <p className="result-value">₹{results.totalInvested.toLocaleString()}</p>
              <small>Lumpsum + Total SIP</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <h4>Lumpsum Returns</h4>
              <p className="result-value">₹{results.FV_Lumpsum.toLocaleString()}</p>
              <small>Future value of one-time investment</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <h4>SIP Returns</h4>
              <p className="result-value">₹{results.FV_SIP.toLocaleString()}</p>
              <small>Future value of monthly SIP</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <h4>Total Future Value</h4>
              <p className="result-value">₹{results.totalFutureValue.toLocaleString()}</p>
              <small>Combined maturity amount</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <h4>Wealth Gain</h4>
              <p className="result-value">₹{results.totalGain.toLocaleString()}</p>
              <small>Total profit earned</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'}}>
              <h4>Return on Investment</h4>
              <p className="result-value">{((results.totalGain / results.totalInvested) * 100).toFixed(2)}%</p>
              <small>Overall ROI percentage</small>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-section">
            <h3>📈 Growth Projection - Year by Year</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" stroke="#8884d8" strokeWidth={2} name="Total Invested" />
                <Line type="monotone" dataKey="lumpsumValue" stroke="#f5576c" strokeWidth={2} name="Lumpsum Value" />
                <Line type="monotone" dataKey="sipValue" stroke="#4facfe" strokeWidth={2} name="SIP Value" />
                <Line type="monotone" dataKey="totalValue" stroke="#43e97b" strokeWidth={3} name="Total Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Chart */}
          <div className="chart-section">
            <h3>📊 Contribution Breakdown</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={results.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="lumpsumValue" fill="#f5576c" name="Lumpsum Growth" />
                <Bar dataKey="sipValue" fill="#4facfe" name="SIP Growth" />
              </BarChart>
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
                    <td style={{fontWeight: 'bold', color: '#10b981'}}>₹{row.totalValue.toLocaleString()}</td>
                    <td style={{color: '#10b981'}}>₹{(row.totalValue - row.invested).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        .result-card small {
          font-size: 13px;
          opacity: 0.8;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          padding: 12px;
          text-align: right;
          border-bottom: 1px solid #e0e0e0;
        }

        th {
          background: #667eea;
          color: white;
          font-weight: 600;
        }

        tr:hover {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
