import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- CORE CALCULATION ENGINE (Logic is sound) ---
function simulatePayoff(initialDebts, extraPayment, method) {
    let debts = initialDebts.map(d => ({
        ...d,
        id: d.name + (d.principal || '0'),
        balance: parseFloat(d.principal) || 0,
        rate: parseFloat(d.interestRate) || 0,
        min_payment: parseFloat(d.emi) || 0,
        original_min_payment: parseFloat(d.emi) || 0,
        payoffMonth: null,
    }));
    const baseline = calculateBaseline(initialDebts);
    let month = 0;
    let totalInterestPaid = 0;
    const initialTotalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

    while (debts.some(d => d.balance > 0) && month < 600) {
        month++;
        const sortedPendingDebts = debts.filter(d => d.balance > 0).sort((a, b) => {
            if (method === 'Avalanche') return b.rate - a.rate;
            if (method === 'Snowball') return a.balance - b.balance;
            return 0;
        });
        let extraPaymentPool = extraPayment || 0;
        debts.forEach(d => {
            if (d.balance === 0) extraPaymentPool += d.original_min_payment;
        });
        for (const debt of debts) {
            if (debt.balance > 0) {
                const monthlyInterest = debt.balance * (debt.rate / 100 / 12);
                totalInterestPaid += monthlyInterest;
                debt.balance += monthlyInterest;
                let payment = debt.min_payment;
                if (sortedPendingDebts.length > 0 && debt.id === sortedPendingDebts[0].id) {
                    payment += extraPaymentPool;
                }
                const finalPayment = Math.min(debt.balance, payment);
                debt.balance -= finalPayment;
                if (debt.balance <= 0.005 && debt.payoffMonth === null) {
                    debt.balance = 0;
                    debt.payoffMonth = month;
                    debt.min_payment = 0;
                }
            }
        }
    }
    const interestSaved = baseline.totalInterest - totalInterestPaid;
    const timeSaved = baseline.months > 0 ? baseline.months - month : 0;
    return {
        months: month,
        totalInterest: totalInterestPaid.toFixed(2),
        totalPrincipal: initialTotalDebt.toFixed(2),
        interestSaved: interestSaved > 0 ? interestSaved.toFixed(2) : '0.00',
        timeSaved: timeSaved > 0 ? timeSaved : 0,
    };
}

function calculateBaseline(initialDebts) {
    let baselineMonths = 0;
    let baselineInterest = 0;
    initialDebts.forEach(d => {
        const principal = parseFloat(d.principal) || 0;
        const rate = (parseFloat(d.interestRate) || 0) / 100 / 12;
        const emi = parseFloat(d.emi) || 0;
        if (emi > principal * rate && rate > 0) {
            const n = -(Math.log(1 - (principal * rate) / emi) / Math.log(1 + rate));
            baselineMonths = Math.max(baselineMonths, Math.ceil(n));
            baselineInterest += (emi * Math.ceil(n)) - principal;
        } else if (emi > 0 && principal > 0 && rate === 0) {
            baselineMonths = Math.max(baselineMonths, Math.ceil(principal / emi));
        }
    });
    return { months: baselineMonths, totalInterest: baselineInterest };
}

// --- React Component ---
export default function DebtManager() {
  const [debts, setDebts] = useState([
    { name: 'HDFC Credit Card', principal: '56679', interestRate: '18', emi: '5000' },
    { name: 'Car Loan', principal: '450000', interestRate: '8.5', emi: '12000' },
    { name: 'Personal Loan', principal: '120000', interestRate: '14', emi: '8000' },
  ]);
  const [newDebt, setNewDebt] = useState({ name: '', principal: '', interestRate: '', emi: '' });
  const [extraPayment, setExtraPayment] = useState('5000');
  const [results, setResults] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e) => {
    setNewDebt(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAddDebt = (e) => {
    e.preventDefault();
    if (newDebt.name && newDebt.principal && newDebt.interestRate && newDebt.emi) {
      setDebts(prev => [...prev, newDebt]);
      setNewDebt({ name: '', principal: '', interestRate: '', emi: '' });
    }
  };
  const handleRemoveDebt = (index) => {
    setDebts(prev => prev.filter((_, i) => i !== index));
  };
  const handleCalculate = useCallback(() => {
    if (debts.length > 0) {
      setResults({
        snowball: simulatePayoff(debts, parseFloat(extraPayment) || 0, 'Snowball'),
        avalanche: simulatePayoff(debts, parseFloat(extraPayment) || 0, 'Avalanche'),
      });
    } else {
      setResults(null);
    }
  }, [debts, extraPayment]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const totalOutstanding = debts.reduce((sum, d) => sum + (parseFloat(d.principal) || 0), 0);
  const totalMonthlyEMI = debts.reduce((sum, d) => sum + (parseFloat(d.emi) || 0), 0);
  const weightedInterest = totalOutstanding > 0 ? (debts.reduce((sum, d) => sum + (parseFloat(d.principal) || 0) * (parseFloat(d.interestRate) || 0), 0) / totalOutstanding).toFixed(2) : 0;
  const allocationData = debts.map(d => ({ name: d.name, value: parseFloat(d.principal) || 0 }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="debt-manager-container">
      <header>
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
          <h1>Debt Management <span>& Optimization Dashboard</span></h1>
        </div>
      </header>
      <main>
        <section className="metrics-grid">
            <div className="metric-card"><h4>Total Outstanding Debt</h4><p>₹{totalOutstanding.toLocaleString('en-IN')}</p></div>
            <div className="metric-card"><h4>Avg. Interest Rate</h4><p>{weightedInterest}%</p></div>
            <div className="metric-card"><h4>Total Monthly Payment</h4><p>₹{(totalMonthlyEMI + (parseFloat(extraPayment) || 0)).toLocaleString('en-IN')}</p></div>
            
            {/* THIS IS THE FIXED LINE */}
            <div className="metric-card"><h4>Debt-Free By (Avalanche)</h4><p>{results ? ${Math.floor(results.avalanche.months / 12)}Y ${results.avalanche.months % 12}M : 'N/A'}</p></div>

        </section>

        <section className="card">
          <div className="card-header"><h3>Add New Debt</h3></div>
          <form onSubmit={handleAddDebt} className="add-debt-form">
              <div className="form-group"><label>Debt Name</label><input type="text" name="name" value={newDebt.name} onChange={handleInputChange} placeholder="e.g., Personal Loan" required/></div>
              <div className="form-group"><label>Outstanding Amount (₹)</label><input type="number" name="principal" value={newDebt.principal} onChange={handleInputChange} placeholder="50000" required/></div>
              <div className="form-group"><label>Annual Interest Rate (%)</label><input type="number" name="interestRate" value={newDebt.interestRate} onChange={handleInputChange} placeholder="12" required/></div>
              <div className="form-group"><label>EMI (₹) / Min. Payment</label><input type="number" name="emi" value={newDebt.emi} onChange={handleInputChange} placeholder="10000" required/></div>
              <button type="submit" className="add-button">Add Debt</button>
          </form>
        </section>
        
        <div className="holdings-grid">
            <section className="card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header holdings-header"><h3>Your Debts ({debts.length} total)</h3><span>Total: ₹{totalOutstanding.toLocaleString('en-IN')}</span></div>
                <div className="holdings-table"><table><thead><tr><th>Debt Name</th><th>Amount</th><th>Interest Rate</th><th>EMI</th><th>Actions</th></tr></thead>
                <tbody>{debts.map((d, i) => (<tr key={i}><td>{d.name}</td><td>₹{(parseFloat(d.principal) || 0).toLocaleString('en-IN')}</td><td>{d.interestRate}%</td><td>₹{(parseFloat(d.emi) || 0).toLocaleString('en-IN')}</td><td><button className="btn-edit" title="Edit functionality to be implemented">Edit</button><button className="btn-delete" onClick={() => handleRemoveDebt(i)}>Delete</button></td></tr>))}</tbody>
                </table></div>
            </section>
            <section className="card">
                <div className="card-header"><h3>Debt Allocation</h3></div>
                <div className="chart-container">
                    {isClient && (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {allocationData.map((entry, index) => <Cell key={cell-${index}} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value, name) => [₹${value.toLocaleString('en-IN')}, name]}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </section>
        </div>

        <section className="card">
            <div className="card-header"><h3>Repayment Strategy Simulation</h3></div>
            <div className="simulation-controls"><label>Additional Monthly Payment (₹)<input type="number" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} /></label><button onClick={handleCalculate} className="recalculate-btn">Recalculate Plan</button></div>
        </section>

        {results && (
             <section className="results-comparison">
                <div className="card result-card">
                    <h3 className="result-title">Debt Snowball</h3><p className="result-subtitle">Pay off smallest debts first</p>
                    <div className="result-metrics">
                        <div><span>Payoff Time</span><strong>{Math.floor(results.snowball.months / 12)}Y {results.snowball.months % 12}M</strong></div>
                        <div><span>Total Interest</span><strong>₹{parseFloat(results.snowball.totalInterest).toLocaleString('en-IN')}</strong></div>
                        <div><span>Time Saved</span><strong className="positive">{results.snowball.timeSaved} Months</strong></div>
                        <div><span>Interest Saved</span><strong className="positive">₹{parseFloat(results.snowball.interestSaved).toLocaleString('en-IN')}</strong></div>
                    </div>
                </div>
                <div className="card result-card">
                    <h3 className="result-title">Debt Avalanche</h3><p className="result-subtitle">Pay off highest interest first (Recommended)</p>
                     <div className="result-metrics">
                        <div><span>Payoff Time</span><strong>{Math.floor(results.avalanche.months / 12)}Y {results.avalanche.months % 12}M</strong></div>
                        <div><span>Total Interest</span><strong>₹{parseFloat(results.avalanche.totalInterest).toLocaleString('en-IN')}</strong></div>
                        <div><span>Time Saved</span><strong className="positive">{results.avalanche.timeSaved} Months</strong></div>
                         <div><span>Interest Saved</span><strong className="positive">₹{parseFloat(results.avalanche.interestSaved).toLocaleString('en-IN')}</strong></div>
                    </div>
                </div>
            </section>
        )}
      </main>
      
      <style jsx>{`
        /* --- Styles are unchanged --- */
        .debt-manager-container { background-color: #f0f2f5; padding: 2rem; font-family: 'Inter', sans-serif; }
        .chart-container { width: 100%; height: 300px; }
        header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .logo { display: flex; align-items: center; gap: 0.5rem; color: #1e3a8a; }
        .logo h1 { font-size: 1.5rem; font-weight: 600; }
        .logo h1 span { font-weight: 400; color: #64748b; }
        main { display: flex; flex-direction: column; gap: 1.5rem; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); overflow: hidden; }
        .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #334155; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .metric-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .metric-card h4 { margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.875rem; font-weight: 500; }
        .metric-card p { margin: 0; font-size: 1.75rem; font-weight: 600; color: #1e3a8a; }
        .add-debt-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 1.5rem; align-items: flex-end;}
        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 0.5rem; font-size: 0.875rem; color: #475569; }
        .form-group input { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
        .add-button { grid-column: 1 / -1; padding: 0.875rem; background-color: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
        .add-button:hover { background-color: #1d4ed8; }
        .holdings-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 1.5rem; }
        .holdings-header { display: flex; justify-content: space-between; align-items: center; }
        .holdings-header span { font-weight: 600; color: #1e3a8a; }
        .holdings-table table { width: 100%; border-collapse: collapse; }
        .holdings-table th, .holdings-table td { padding: 0.75rem 1.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .holdings-table th { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
        .holdings-table td { font-size: 0.875rem; color: #334155; }
        .btn-edit, .btn-delete { border: none; padding: 0.3rem 0.7rem; margin-right: 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;}
        .btn-edit { background-color: #f1f5f9; color: #475569; }
        .btn-delete { background-color: #fee2e2; color: #ef4444; }
        .simulation-controls { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .simulation-controls label { display: flex; flex-direction: column; flex-grow: 1; }
        .simulation-controls input { margin-top: 0.5rem; padding: 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; }
        .recalculate-btn { padding: 0.75rem 1.5rem; background-color: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; }
        .results-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .result-card { padding: 1.5rem; }
        .result-title { font-size: 1.25rem; font-weight: 600; color: #1e3a8a; margin: 0; }
        .result-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 1.5rem 0; }
        .result-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .result-metrics div span { font-size: 0.875rem; color: #64748b; display: block; }
        .result-metrics div strong { font-size: 1.25rem; font-weight: 600; color: #334155; }
        .result-metrics .positive { color: #10b981; }

        @media (max-width: 1024px) {
            .holdings-grid { grid-template-columns: 1fr; }
            .results-comparison { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
            .add-debt-form { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
