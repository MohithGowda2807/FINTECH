import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// A function to format large numbers for readability
const formatAxis = (tickItem) => {
  if (tickItem >= 10000000) return `${(tickItem / 10000000).toFixed(1)} Cr`;
  if (tickItem >= 100000) return `${(tickItem / 100000).toFixed(1)} L`;
  return tickItem.toLocaleString();
};

// A custom tooltip for a better user experience
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`End of Year ${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.stroke || pld.fill, margin: '4px 0' }}>
            {`${pld.name}: ₹${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
    const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
    const t = Number(inputs.tenure);

    let sipValue = 0;
    let totalSIPInvested = 0;
    let currentSIP = initialSIP;
    let constantSIPValue = 0;

    const yearlyData = [];
    const comparisonData = [];

    for (let year = 1; year <= t; year++) {
      let yearlySipContribution = 0;
      for (let month = 1; month <= 12; month++) {
        sipValue = (sipValue + currentSIP) * (1 + monthlyRate);
        constantSIPValue = (constantSIPValue + initialSIP) * (1 + monthlyRate);
        yearlySipContribution += currentSIP;
      }
      totalSIPInvested += yearlySipContribution;

      const lumpsumValue = L * Math.pow(1 + annualReturn, year);
      const totalValue = lumpsumValue + sipValue;

      yearlyData.push({
        year,
        sipAmount: Math.round(currentSIP),
        invested: Math.round(totalSIPInvested + L),
        value: Math.round(totalValue),
      });
      
      comparisonData.push({
          year,
          constantSIP: Math.round(constantSIPValue),
          stepUpSIP: Math.round(sipValue),
          difference: Math.round(sipValue - constantSIPValue)
      });

      // Step up the SIP for the next year
      currentSIP *= (1 + stepUp);
    }
    
    const FV_Lumpsum = L * Math.pow(1 + annualReturn, t);
    const FV_SIP = sipValue;
    const totalFutureValue = FV_Lumpsum + FV_SIP;
    const totalInvested = L + totalSIPInvested;
    const totalGain = totalFutureValue - totalInvested;

    setResults({
      totalInvested: Math.round(totalInvested),
      totalSIPInvested: Math.round(totalSIPInvested),
      FV_Lumpsum: Math.round(FV_Lumpsum),
      FV_SIP: Math.round(FV_SIP),
      totalFutureValue: Math.round(totalFutureValue),
      totalGain: Math.round(totalGain),
      stepUpAdvantage: Math.round(FV_SIP - constantSIPValue),
      yearlyData,
      comparisonData,
    });
  };

  return (
    <div className="calculator-container">
      <h2>📈 Lumpsum + Step-Up SIP Calculator</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
        Project your wealth by combining a one-time investment with an annually increasing SIP.
      </p>

      {/* Input Form */}
      <div className="input-section">
        <div className="input-group-row">
            <div className="input-group">
                <label>Lumpsum Investment (₹)</label>
                <input
                type="number"
                value={inputs.lumpsum}
                onChange={(e) => setInputs({...inputs, lumpsum: e.target.value})}
                />
            </div>
            <div className="input-group">
                <label>Starting Monthly SIP (₹)</label>
                <input
                type="number"
                value={inputs.monthlySIP}
                onChange={(e) => setInputs({...inputs, monthlySIP: e.target.value})}
                />
            </div>
        </div>

        <div className="input-group-row">
            <div className="input-group">
                <label>Step-Up Rate (% p.a.)</label>
                <input
                type="number"
                value={inputs.stepUpRate}
                onChange={(e) => setInputs({...inputs, stepUpRate: e.target.value})}
                step="1"
                min="0"
                max="100"
                />
            </div>
            <div className="input-group">
                <label>Expected Return (% p.a.)</label>
                <input
                type="number"
                value={inputs.returnRate}
                onChange={(e) => setInputs({...inputs, returnRate: e.target.value})}
                step="0.5"
                min="0"
                max="100"
                />
            </div>
            <div className="input-group">
                <label>Investment Tenure (Years)</label>
                <input
                type="number"
                value={inputs.tenure}
                onChange={(e) => setInputs({...inputs, tenure: e.target.value})}
                min="1"
                max="100"
                />
            </div>
        </div>
      </div>
        <button onClick={calculate} className="calculate-btn">
          Calculate Returns
        </button>

      {/* Results */}
      {results && (
        <div className="results">
          <div className="results-grid">
            <div className="result-card">
              <h4>Total Invested</h4>
              <p className="amount">₹{results.totalInvested.toLocaleString()}</p>
            </div>
            <div className="result-card">
              <h4>Total Future Value</h4>
              <p className="amount gain">₹{results.totalFutureValue.toLocaleString()}</p>
            </div>
            <div className="result-card">
              <h4>Wealth Gain</h4>
              <p className="amount gain">₹{results.totalGain.toLocaleString()}</p>
            </div>
            <div className="result-card">
              <h4>Step-Up Advantage</h4>
              <p className="amount">₹{results.stepUpAdvantage.toLocaleString()}</p>
               <small>Extra gain vs constant SIP</small>
            </div>
          </div>

          <div className="chart-container">
            <h3>📈 Growth Projection</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={results.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" dataKey="year" domain={['dataMin', 'dataMax']} label={{ value: "Years", position: 'insideBottom', offset: -15, fill: '#666' }} tick={{ fill: '#666', fontSize: 12 }} stroke="#ccc" />
                <YAxis tickFormatter={formatAxis} label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: '#666' }} tick={{ fill: '#666', fontSize: 12 }} stroke="#ccc" />
                <Tooltip content={<CustomTooltip />}/>
                <Legend wrapperStyle={{ paddingTop: "20px" }}/>
                <Area type="monotone" dataKey="invested" stroke="#475569" fill="url(#colorInvested)" name="Total Invested" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorValue)" name="Your Investment Value" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
           <div className="chart-container">
            <h3>📊 Constant SIP vs Step-Up SIP Value</h3>
             <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={results.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                 <defs>
                    <linearGradient id="colorStepUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorConstant" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="year" domain={['dataMin', 'dataMax']} label={{ value: 'Years', position: 'insideBottom', offset: -15, fill: '#666' }} tick={{ fill: '#666', fontSize: 12 }}/>
                <YAxis tickFormatter={formatAxis} label={{ value: 'Value (₹)', angle: -90, position: 'insideLeft', fill: '#666' }} tick={{ fill: '#666', fontSize: 12 }}/>
                <Tooltip content={<CustomTooltip />}/>
                <Legend wrapperStyle={{ paddingTop: "20px" }}/>
                <Area type="monotone" dataKey="constantSIP" stroke="#8884d8" fill="url(#colorConstant)" strokeWidth={2} name="Constant SIP Value" />
                <Area type="monotone" dataKey="stepUpSIP" stroke="#10b981" fill="url(#colorStepUp)" strokeWidth={3} name="Step-Up SIP Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="table-section">
            <h3>📅 Year-by-Year SIP Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Monthly SIP</th>
                  <th>Total Investment</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>₹{row.sipAmount.toLocaleString()}</td>
                    <td>₹{row.invested.toLocaleString()}</td>
                    <td style={{fontWeight: 'bold', color: '#10b981'}}>₹{row.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Styles copied from GoalCalculator for consistency */
        .input-section { background-color: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .input-group { margin-bottom: 20px; }
        .input-group:last-child { margin-bottom: 0; }
        .input-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        .input-group input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: border-color 0.2s; }
        .input-group input:focus { outline: none; border-color: #667eea; }
        .input-group-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
        .calculate-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .calculate-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .results { margin-top: 30px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .result-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .result-card h4 { margin-top: 0; margin-bottom: 10px; color: #555; font-size: 1rem; }
        .amount { font-size: 1.8rem; font-weight: bold; margin: 5px 0; color: #667eea; }
        .amount.gain { color: #22c55e; }
        .result-card small { color: #666; font-size: 0.85rem; }
        .chart-container { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); margin-top: 30px; }
        .chart-container h3 { text-align: center; margin-bottom: 20px; color: #333; }
        .custom-tooltip { background-color: rgba(255, 255, 255, 0.95); border: 1px solid #ccc; padding: 10px 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .custom-tooltip .label { font-weight: bold; color: #333; }
        .table-section { margin-top: 30px; }
        .table-section h3 { text-align: center; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: right;}
        tbody tr:hover { background: #f8fafc; }
      `}</style>
    </div>
  );
}
//abcgyweb
