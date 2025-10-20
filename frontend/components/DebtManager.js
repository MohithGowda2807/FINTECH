import React, { useState, useEffect } from 'react';
import axios from 'axios';

function calculateEMI(P, rate, n) {
  const r = rate / 12 / 100;
  if (n <= 0 || r === 0) return 0;
  return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function orderDebts(debts, method = 'Avalanche') {
  return debts.slice().sort((a, b) => {
    if (method === 'Avalanche') return b.interest_rate - a.interest_rate;
    if (method === 'Snowball') return a.principal - b.principal;
    return 0;
  });
}

function DebtManager({ userId }) {
  const [debts, setDebts] = useState([]);
  const [form, setForm] = useState({
    debt_type: '',
    principal: '',
    interest_rate: '',
    emi: '',
    tenure_months: '',
    min_payment: '',
    extra_monthly_payment: ''
  });
  const [repaymentMethod, setRepaymentMethod] = useState('Avalanche');

  const fetchDebts = async () => {
    // FIX: The URL was not a valid string. Corrected with backticks.
    const res = await axios.get(`/api/debt/${userId}`);
    setDebts(res.data);
  };
  useEffect(() => { if (userId) { fetchDebts(); } }, [userId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    await axios.post('/api/debt', { user_id: userId, ...form });
    setForm({
      debt_type: '',
      principal: '',
      interest_rate: '',
      emi: '',
      tenure_months: '',
      min_payment: '',
      extra_monthly_payment: ''
    });
    fetchDebts();
  };

  const orderedDebts = orderDebts(debts, repaymentMethod);
  const totalEMI = orderedDebts.reduce((sum, d) => sum + Number(d.emi || 0), 0);

  return (
    <div className="calculator-container">
      <h2>Debt Manager & Optimization</h2>

      <form className="input-group" onSubmit={handleAdd} style={{ maxWidth: 600, margin: "0 auto" }}>
        <label>Debt Type</label>
        <input name="debt_type" type="text" value={form.debt_type} onChange={handleChange} placeholder="e.g. Credit Card, Home Loan" required />
        
        <label>Principal (₹)</label>
        <input name="principal" type="number" value={form.principal} onChange={handleChange} placeholder="e.g. 300000" required />

        <label>Interest Rate (%)</label>
        <input name="interest_rate" type="number" value={form.interest_rate} onChange={handleChange} placeholder="e.g. 15" required />

        <label>EMI (₹/month)</label>
        <input name="emi" type="number" value={form.emi} onChange={handleChange} placeholder="e.g. 10000" required />

        <label>Tenure (months)</label>
        <input name="tenure_months" type="number" value={form.tenure_months} onChange={handleChange} placeholder="e.g. 36" required />

        <label>Min Payment (for cards, optional)</label>
        <input name="min_payment" type="number" value={form.min_payment} onChange={handleChange} placeholder="e.g. 5000" />

        <label>Extra Monthly Payment (optional)</label>
        <input name="extra_monthly_payment" type="number" value={form.extra_monthly_payment} onChange={handleChange} placeholder="e.g. 2000" />

        <label style={{ marginTop: 8 }}>Repayment Strategy</label>
        <select
          name="repaymentMethod"
          value={repaymentMethod}
          onChange={e => setRepaymentMethod(e.target.value)}
          style={{ marginBottom: 18 }}
        >
          <option value="Avalanche">Avalanche (Highest Interest First)</option>
          <option value="Snowball">Snowball (Smallest Debt First)</option>
        </select>

        <button className="add-btn" type="submit" style={{ marginTop: 8 }}>
          Add Debt
        </button>
      </form>

      <div className="results">
        <div className="result-card" style={{ margin: "30px auto 16px", maxWidth: 500 }}>
          <h3>Total EMI per Month</h3>
          {/* FIX: Invalid string. Corrected with backticks. */}
          <div className="amount">{totalEMI > 0 ? `₹${totalEMI}` : '—'}</div>
        </div>
      </div>

      {orderedDebts.length > 0 && (
        <div className="summary-card" style={{ marginTop: 40, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>EMI</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody>
              {orderedDebts.map(d => (
                <tr key={d.id}>
                  <td>{d.debt_type}</td>
                  <td>₹{d.principal}</td>
                  <td>{d.interest_rate}%</td>
                  <td>₹{d.emi}</td>
                  <td>{d.tenure_months} mo.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DebtManager;
