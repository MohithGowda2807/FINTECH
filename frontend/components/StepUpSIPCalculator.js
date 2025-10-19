import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StepUpSIPCalculator() {
  const [inputs, setInputs] = useState({
    lumpsum: 100000,
    monthlySIP: 5000,
    stepUpRate: 10,
    returnRate: 12,
    tenure: 10
  });

  const [results, setResults] = useState(null);

  const calculate = () => {
    const L = Number(inputs.lumpsum);
    const initialSIP = Number(inputs.monthlySIP);
    const stepUp = Number(inputs.stepUpRate) / 100;
    const annualReturn = Number(inputs.returnRate) / 100;
    const r = annualReturn / 12; // Monthly rate
    const t = Number(inputs.tenure);

    // Future Value of Lumpsum
    const FV_Lumpsum = L * Math.pow(1 + annualReturn, t);

    // Calculate Step-Up SIP
    let totalSIPInvested = 0;
    let FV_SIP = 0;
    const yearlyBreakdown = [];
    const comparisonData = [];

    for (let year = 1; year <= t; year++) {
      // SIP amount for this year
      const sipThisYear = initialSIP * Math.pow(1 + stepUp, year - 1);
      const monthlyAmount = sipThisYear;
      
      // Months remaining for this year's SIP to grow
      const monthsRemaining = (t - year + 1) * 12;
      
      // Future value of this year's SIP contributions
      const fvThisYear = monthlyAmount * (((Math.pow(1 + r, monthsRemaining) - 1) / r) * (1 + r));
      
      totalSIPInvested += monthlyAmount * 12;
      FV_SIP += fvThisYear;

      // For constant SIP comparison
      const constantSIPValue = initialSIP * (((Math.pow(1 + r, year * 12) - 1) / r) * (1 + r));
      const stepUpSIPValue = FV_SIP;

      yearlyBreakdown.push({
        year: year,
        sipAmount: Math.round(monthlyAmount),
        yearlyInvestment: Math.round(monthlyAmount * 12),
        cumulativeInvested: Math.round(totalSIPInvested),
        futureValue: Math.round(FV_SIP)
      });

      comparisonData.push({
        year: year,
        constantSIP: Math.round(constantSIPValue),
        stepUpSIP: Math.round(stepUpSIPValue),
        difference: Math.round(stepUpSIPValue - constantSIPValue)
      });
    }

    const totalInvested = L + totalSIPInvested;
    const totalFutureValue = FV_Lumpsum + FV_SIP;
    const totalGain = totalFutureValue - totalInvested;

    // Calculate constant SIP for comparison
    const constantSIPFV = initialSIP * (((Math.pow(1 + r, t * 12) - 1) / r) * (1 + r));
    const constantSIPInvested = initialSIP * 12 * t;

    setResults({
      totalInvested: Math.round(totalInvested),
      totalSIPInvested: Math.round(totalSIPInvested),
      FV_Lumpsum: Math.round(FV_Lumpsum),
      FV_SIP: Math.round(FV_SIP),
      totalFutureValue: Math.round(totalFutureValue),
      totalGain: Math.round(totalGain),
      constantSIPFV: Math.round(constantSIPFV),
      constantSIPInvested: Math.round(constantSIPInvested),
      stepUpAdvantage: Math.round(FV_SIP - constantSIPFV),
      yearlyBreakdown,
      comparisonData
    });
  };

  return (
    <div className="calculator-container">
      <h2>📈 Lumpsum + Step-Up SIP Calculator</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
        Simulate combined lumpsum + SIP with annual step-up increases
      </p>

      {/* Input Form */}
      <div className="input-section">
        <div className="input-group">
          <label>Initial Lumpsum Investment (₹)</label>
          <input
            type="number"
            value={inputs.lumpsum}
            onChange={(e) => setInputs({...inputs, lumpsum: e.target.value})}
            placeholder="100000"
          />
          <small>One-time investment at start</small>
        </div>

        <div className="input-group">
          <label>Starting Monthly SIP (₹)</label>
          <input
            type="number"
            value={inputs.monthlySIP}
            onChange={(e) => setInputs({...inputs, monthlySIP: e.target.value})}
            placeholder="5000"
          />
          <small>Initial monthly contribution (will increase yearly)</small>
        </div>

        <div className="input-group">
          <label>Step-Up Rate (% per year)</label>
          <input
            type="number"
            value={inputs.stepUpRate}
            onChange={(e) => setInputs({...inputs, stepUpRate: e.target.value})}
            placeholder="10"
            step="1"
          />
          <small>Annual increase in SIP amount (e.g., 10% = ₹5000 → ₹5500 next year)</small>
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
          <label>Investment Tenure (Years)</label>
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
          Calculate Step-Up Returns
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h4>Total Invested</h4>
              <p className="result-value">₹{results.totalInvested.toLocaleString()}</p>
              <small>Lumpsum + Step-Up SIP</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <h4>Lumpsum Returns</h4>
              <p className="result-value">₹{results.FV_Lumpsum.toLocaleString()}</p>
              <small>Lumpsum maturity value</small>
            </div>

            <div className="result-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <h4>Step-Up SIP Returns</h4>
              <p className="result-value">₹{results.FV_SIP.toLocaleString()}</p>
              <small>SIP with annual increases</small>
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
              <h4>Step-Up Advantage</h4>
              <p className="result-value">₹{results.stepUpAdvantage.toLocaleString()}</p>
              <small>Extra gain vs constant SIP</small>
            </div>
          </div>

          {/* Dual Progress Bars */}
          <div style={{margin: '30px 0'}}>
            <h3>📊 Investment Contribution Split</h3>
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <span>Lumpsum Contribution</span>
                <span>₹{inputs.lumpsum.toLocaleString()} ({((Number(inputs.lumpsum) / results.totalInvested) * 100).toFixed(1)}%)</span>
              </div>
              <div style={{height: '30px', background: '#e0e0e0', borderRadius: '15px', overflow: 'hidden'}}>
                <div style={{
                  height: '100%',
                  width: `${(Number(inputs.lumpsum) / results.totalInvested) * 100}%`,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <span>Step-Up SIP Contribution</span>
                <span>₹{results.totalSIPInvested.toLocaleString()} ({((results.totalSIPInvested / results.totalInvested) * 100).toFixed(1)}%)</span>
              </div>
              <div style={{height: '30px', background: '#e0e0e0', borderRadius: '15px', overflow: 'hidden'}}>
                <div style={{
                  height: '100%',
                  width: `${(results.totalSIPInvested / results.totalInvested) * 100}%`,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  transition: 'width 1s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="chart-section">
            <h3>📈 Constant SIP vs Step-Up SIP Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="constantSIP" stroke="#8884d8" strokeWidth={2} name="Constant SIP" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="stepUpSIP" stroke="#10b981" strokeWidth={3} name="Step-Up SIP" />
                <Line type="monotone" dataKey="difference" stroke="#f59e0b" strokeWidth={2} name="Extra Gain" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly SIP Increase Chart */}
          <div className="chart-section">
            <h3>📊 Annual SIP Amount Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={results.yearlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sipAmount" fill="#4facfe" name="Monthly SIP Amount" />
                <Bar dataKey="yearlyInvestment" fill="#43e97b" name="Yearly Investment" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Step-Up Breakdown Table */}
          <div className="table-section">
            <h3>📅 Step-Up SIP Growth Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Monthly SIP</th>
                  <th>Yearly Investment</th>
                  <th>Cumulative Invested</th>
                  <th>Future Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>₹{row.sipAmount.toLocaleString()}</td>
                    <td>₹{row.yearlyInvestment.toLocaleString()}</td>
                    <td>₹{row.cumulativeInvested.toLocaleString()}</td>
                    <td style={{fontWeight: 'bold', color: '#10b981'}}>₹{row.futureValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Insights */}
          <div style={{marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '10px'}}>
            <h3>💡 Key Insights:</h3>
            <ul style={{lineHeight: '1.8'}}>
              <li>Your SIP increases by <strong>{inputs.stepUpRate}%</strong> every year</li>
              <li>Final year monthly SIP: <strong>₹{results.yearlyBreakdown[results.yearlyBreakdown.length - 1].sipAmount.toLocaleString()}</strong></li>
              <li>Step-Up SIP gives <strong>₹{results.stepUpAdvantage.toLocaleString()}</strong> more than constant SIP</li>
              <li>Total wealth gain: <strong>₹{results.totalGain.toLocaleString()}</strong> ({((results.totalGain / results.totalInvested) * 100).toFixed(2)}% ROI)</li>
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
