import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'; // Add chart import if needed for visualization
//hello how r u all>>?? asdfghj
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

  const fetchDebts = async () => {
    const res = await axios.get(`/api/debt/${userId}`);
    setDebts(res.data);
  };
  useEffect(() => { fetchDebts(); }, [userId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdd = async e => {
    e.preventDefault();
    await axios.post('/api/debt', { user_id: userId, ...form });
    setForm({
      debt_type: '', principal: '', interest_rate: '', emi: '', tenure_months: '', min_payment: '', extra_monthly_payment: ''
    });
    fetchDebts();
  };

  return (
    <div className="debt-manager">
      <h2>Debt Manager</h2>
      <form onSubmit={handleAdd}>
        <input name="debt_type" value={form.debt_type} onChange={handleChange} placeholder="Debt Type" required />
        <input name="principal" type="number" value={form.principal} onChange={handleChange} placeholder="Principal" required />
        <input name="interest_rate" type="number" value={form.interest_rate} onChange={handleChange} placeholder="Interest Rate (%)" required />
        <input name="emi" type="number" value={form.emi} onChange={handleChange} placeholder="EMI" required />
        <input name="tenure_months" type="number" value={form.tenure_months} onChange={handleChange} placeholder="Tenure (months)" required />
        <input name="min_payment" type="number" value={form.min_payment} onChange={handleChange} placeholder="Min Payment" />
        <input name="extra_monthly_payment" type="number" value={form.extra_monthly_payment} onChange={handleChange} placeholder="Extra Monthly Payment" />
        <button type="submit">Add Debt</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Type</th><th>Principal</th><th>Interest</th><th>EMI</th><th>Term</th>
          </tr>
        </thead>
        <tbody>
          {debts.map(d => (
            <tr key={d.id}>
              <td>{d.debt_type}</td>
              <td>{d.principal}</td>
              <td>{d.interest_rate}%</td>
              <td>{d.emi}</td>
              <td>{d.tenure_months} mo.</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add chart for visualization if needed */}
    </div>
  );
}

export default DebtManager;
