import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DebtManager() {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    type: "Credit Card",
    name: "",
    principal: "",
    interestRate: "",
    emi: "",
    emisLeft: "",
    minPayment: "",
    extraPayment: "",
  });
  const [viewMode, setViewMode] = useState("input");
  const [results, setResults] = useState(null);

  const debtTypes = [
    "Home Loan",
    "Car Loan",
    "Credit Card",
    "Education Loan",
    "Personal Loan",
    "Other",
  ];

  const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#0ea5e9"];

  const addDebt = () => {
    if (
      !newDebt.name ||
      !newDebt.principal ||
      !newDebt.interestRate ||
      !newDebt.emi ||
      !newDebt.emisLeft
    ) {
      alert("⚠️ Please fill all required fields");
      return;
    }
    setDebts([...debts, { ...newDebt, id: Date.now() }]);
    setNewDebt({
      type: "Credit Card",
      name: "",
      principal: "",
      interestRate: "",
      emi: "",
      emisLeft: "",
      minPayment: "",
      extraPayment: "",
    });
  };

  const removeDebt = (id) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const calculateMetrics = () => {
    if (debts.length === 0) return null;

    const totalOutstanding = debts.reduce(
      (sum, d) => sum + parseFloat(d.principal || 0),
      0
    );

    const totalEMI = debts.reduce(
      (sum, d) => sum + parseFloat(d.emi || 0),
      0
    );

    const weightedRate =
      debts.reduce(
        (sum, d) =>
          sum + parseFloat(d.principal || 0) * parseFloat(d.interestRate || 0),
        0
      ) / totalOutstanding;

    const totalExtraPayment = debts.reduce(
      (sum, d) => sum + parseFloat(d.extraPayment || 0),
      0
    );

    return {
      totalOutstanding,
      totalEMI,
      weightedRate,
      totalExtraPayment,
    };
  };

  const calculateDebtFree = () => {
    if (debts.length === 0) {
      alert("⚠️ Please add at least one debt");
      return;
    }

    const simulatePayoff = (debtList, strategy) => {
      let workingDebts = debtList.map((d) => ({
        ...d,
        remaining: parseFloat(d.principal),
        rate: parseFloat(d.interestRate) / 100 / 12,
        monthlyPayment: parseFloat(d.emi),
        extra: parseFloat(d.extraPayment || 0),
      }));

      let month = 0;
      let totalInterest = 0;
      const timeline = [];

      while (workingDebts.some((d) => d.remaining > 0.01) && month < 600) {
        month++;
        let monthlyData = { month, debts: {} };

        workingDebts.forEach((debt) => {
          if (debt.remaining > 0.01) {
            const interest = debt.remaining * debt.rate;
            totalInterest += interest;
            const payment = Math.min(
              debt.monthlyPayment + debt.extra,
              debt.remaining + interest
            );
            debt.remaining += interest - payment;
            if (debt.remaining < 0) debt.remaining = 0;
            monthlyData.debts[debt.name] = debt.remaining;
          }
        });

        timeline.push(monthlyData);
      }

      return { months: month, totalInterest, timeline };
    };

    const snowballOrder = [...debts].sort(
      (a, b) => parseFloat(a.principal) - parseFloat(b.principal)
    );
    const avalancheOrder = [...debts].sort(
      (a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate)
    );

    const snowball = simulatePayoff(snowballOrder, "snowball");
    const avalanche = simulatePayoff(avalancheOrder, "avalanche");

    setResults({ snowball, avalanche });
  };

  const metrics = calculateMetrics();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            padding: '12px 16px',
            border: '2px solid #667eea',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
          }}
        >
          <p style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {payload[0].name}
          </p>
          <p style={{ color: '#667eea', fontSize: '18px', fontWeight: 'bold' }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calculator-container">
      <h2>💳 Debt Manager & Optimization</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Manage your debts and find the best repayment strategy
      </p>

      {/* View Mode Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['input', 'summary', 'strategies'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '12px 24px',
              background: viewMode === mode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
              color: viewMode === mode ? 'white' : '#333',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              textTransform: 'capitalize',
              transition: 'all 0.3s',
            }}
          >
            {mode === 'input' && '📝'} 
            {mode === 'summary' && '📊'} 
            {mode === 'strategies' && '🎯'}
            {' '}{mode}
          </button>
        ))}
      </div>

      {/* INPUT MODE */}
      {viewMode === 'input' && (
        <>
          <div className="input-section">
            <h3 style={{ marginBottom: '20px' }}>➕ Add New Debt</h3>
            <div className="input-group-row">
              <div className="input-group">
                <label>Debt Type *</label>
                <select
                  value={newDebt.type}
                  onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
                >
                  {debtTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Debt Name *</label>
                <input
                  type="text"
                  placeholder="e.g., HDFC Credit Card"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group-row">
              <div className="input-group">
                <label>Outstanding Principal (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g., 300000"
                  value={newDebt.principal}
                  onChange={(e) => setNewDebt({ ...newDebt, principal: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Interest Rate (% p.a.) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 15"
                  value={newDebt.interestRate}
                  onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group-row">
              <div className="input-group">
                <label>Monthly EMI (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g., 10000"
                  value={newDebt.emi}
                  onChange={(e) => setNewDebt({ ...newDebt, emi: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>EMIs Remaining *</label>
                <input
                  type="number"
                  placeholder="e.g., 36"
                  value={newDebt.emisLeft}
                  onChange={(e) => setNewDebt({ ...newDebt, emisLeft: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group-row">
              <div className="input-group">
                <label>Minimum Payment (₹)</label>
                <input
                  type="number"
                  placeholder="For credit cards"
                  value={newDebt.minPayment}
                  onChange={(e) => setNewDebt({ ...newDebt, minPayment: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Extra Monthly Payment (₹)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={newDebt.extraPayment}
                  onChange={(e) => setNewDebt({ ...newDebt, extraPayment: e.target.value })}
                />
              </div>
            </div>

            <button onClick={addDebt} className="calculate-btn">
              ➕ Add Debt
            </button>
          </div>

          {/* Debt List Table */}
          {debts.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>📋 Current Debts ({debts.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Principal</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>EMI</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Tenure</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map((debt, idx) => (
                      <tr key={debt.id} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white', borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}>{debt.type}</td>
                        <td style={{ padding: '12px' }}>{debt.name}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(debt.principal).toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{debt.interestRate}%</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{parseFloat(debt.emi).toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{debt.emisLeft} months</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => removeDebt(debt.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>❌</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={calculateDebtFree} className="calculate-btn" style={{ marginTop: '20px' }}>
                📊 Calculate Debt-Free Plan
              </button>
            </div>
          )}
        </>
      )}

      {/* SUMMARY MODE */}
      {viewMode === 'summary' && metrics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}>
              <h4 style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>💰 Total Outstanding Debt</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{formatCurrency(metrics.totalOutstanding)}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)' }}>
              <h4 style={{ fontSize: '14px', opacity: 0.9', marginBottom: '10px' }}>📆 Monthly EMI Outflow</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{formatCurrency(metrics.totalEMI)}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)' }}>
              <h4 style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>📈 Weighted Interest Rate</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{metrics.weightedRate.toFixed(2)}%</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)' }}>
              <h4 style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>🔥 Extra Payments/Month</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{formatCurrency(metrics.totalExtraPayment)}</p>
            </div>
          </div>

          {/* Pie Chart */}
          {debts.length > 0 && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>🧩 Debt Distribution by Principal</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={debts.map((d) => ({ name: d.name, value: parseFloat(d.principal) }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* STRATEGIES MODE */}
      {viewMode === 'strategies' && results && (
        <>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h3>🎯 Debt Repayment Strategy Comparison</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>Choose the best method to become debt-free faster</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            {/* Snowball Method */}
            <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '30px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)' }}>
              <h3 style={{ marginBottom: '20px' }}>⛄ Debt Snowball Method</h3>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>Pay off smallest debts first for quick wins and motivation</p>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>Time to Debt-Free:</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {Math.floor(results.snowball.months / 12)}Y {results.snowball.months % 12}M
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>Total Interest Paid:</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(results.snowball.totalInterest)}</p>
              </div>
            </div>

            {/* Avalanche Method */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)' }}>
              <h3 style={{ marginBottom: '20px' }}>⚡ Debt Avalanche Method</h3>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>Pay off highest interest debts first to save more money</p>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>Time to Debt-Free:</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {Math.floor(results.avalanche.months / 12)}Y {results.avalanche.months % 12}M
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>Total Interest Paid:</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(results.avalanche.totalInterest)}</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.3)', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>🎉 Interest Saved vs Snowball:</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{formatCurrency(results.snowball.totalInterest - results.avalanche.totalInterest)}</p>
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          {results.snowball.timeline.length > 0 && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>📈 Repayment Timeline Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={results.snowball.timeline.slice(0, Math.min(results.snowball.months, 60)).map((d, idx) => ({
                    month: d.month,
                    snowball: debts.reduce((sum, debt) => sum + (d.debts[debt.name] || 0), 0),
                    avalanche: debts.reduce((sum, debt) => sum + ((results.avalanche.timeline[idx]?.debts[debt.name]) || 0), 0),
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    label={{ value: 'Months', position: 'insideBottom', offset: -15, fill: '#666' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    stroke="#ccc"
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Outstanding Debt', angle: -90, position: 'insideLeft', fill: '#666' }}
                    tick={{ fill: '#666', fontSize: 12 }}
                    stroke="#ccc"
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="snowball"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    name="Snowball Method"
                  />
                  <Line
                    type="monotone"
                    dataKey="avalanche"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    name="Avalanche Method"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Styled JSX */}
      <style jsx>{`
        .input-section {
          background-color: #f9fafb;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .input-group-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
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
          transition: all 0.3s;
        }

        .calculate-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .input-group-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
