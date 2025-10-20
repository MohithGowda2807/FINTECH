import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GoalCalculator() {
  const [inputs, setInputs] = useState({
    goalAmount: 1000000,
    returnRate: 12,
    tenure: 10,
  });

  const [results, setResults] = useState(null);

  const calculate = () => {
    const FV = Number(inputs.goalAmount);
    const r = Math.pow(1 + Number(inputs.returnRate) / 100, 1 / 12) - 1;
    const t = Number(inputs.tenure);
    const n = t * 12;

    // Required Monthly SIP to reach goal
    const SIP = FV / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

    // Required Lumpsum Investment to reach goal
    const Lumpsum = FV / Math.pow(1 + r, n);

    // Yearly breakdown (for chart)
    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const months = year * 12;
      const lumpsumValue = Lumpsum * Math.pow(1 + r, months);
      const sipValue = SIP * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
      yearlyData.push({
        year,
        lumpsumValue: Math.round(lumpsumValue),
        sipValue: Math.round(sipValue),
        totalValue: Math.round(lumpsumValue + sipValue),
      });
    }

    setResults({
      FV: Math.round(FV),
      SIP: Math.round(SIP),
      Lumpsum: Math.round(Lumpsum),
      yearlyData,
    });
  };

  return (
    <div className="calculator-container">
      <h2>🎯 Goal Calculator</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Find how much you need to invest today or monthly to reach your target amount
      </p>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label>Goal Amount (₹)</label>
          <input
            type="number"
            value={inputs.goalAmount}
            onChange={(e) => setInputs({ ...inputs, goalAmount: e.target.value })}
            placeholder="1000000"
          />
          <small>Future amount you want to achieve</small>
        </div>

        <div className="input-group">
          <label>Expected Annual Return (%)</label>
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
            placeholder="10"
            min="1"
            max="40"
          />
          <small>Total investment period (1–40 years)</small>
        </div>

        <button onClick={calculate} className="calculate-btn">
          Calculate Investment Needed
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h4>Target Goal</h4>
              <p className="result-value">₹{results.FV.toLocaleString()}</p>
              <small>Future value you want to achieve</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <h4>Required Lumpsum Investment</h4>
              <p className="result-value">₹{results.Lumpsum.toLocaleString()}</p>
              <small>Invest this amount once today</small>
            </div>

            <div className="result-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <h4>Required Monthly SIP</h4>
              <p className="result-value">₹{results.SIP.toLocaleString()}</p>
              <small>Invest this amount every month</small>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-section">
            <h3>📈 Growth Projection - Year by Year</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="lumpsumValue" stroke="#f5576c" strokeWidth={2} name="Lumpsum Growth" />
                <Line type="monotone" dataKey="sipValue" stroke="#4facfe" strokeWidth={2} name="SIP Growth" />
                <Line type="monotone" dataKey="totalValue" stroke="#43e97b" strokeWidth={3} name="Total Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
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

          {/* Table Section */}
          <div className="table-section">
            <h3>📅 Year-by-Year Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Lumpsum Value</th>
                  <th>SIP Value</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>₹{row.lumpsumValue.toLocaleString()}</td>
                    <td>₹{row.sipValue.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{row.totalValue.toLocaleString()}</td>
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
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th,
        td {
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
