import React, { useState } from 'react';

// --- Calculation Logic (No changes needed here) ---

function orderDebts(debts, method) {
  const debtsCopy = [...debts];
  if (method === 'Avalanche') {
    return debtsCopy.sort((a, b) => b.rate - a.rate);
  }
  if (method === 'Snowball') {
    return debtsCopy.sort((a, b) => a.balance - a.balance);
  }
  return debtsCopy;
}

function simulatePayoff(initialDebts, extraPayment, method) {
  let debts = initialDebts.map(d => ({
    ...d,
    balance: Number(d.balance),
    rate: Number(d.rate),
    min_payment: Number(d.min_payment),
    paid: 0,
    payoffMonth: null,
  }));

  let month = 0;
  let totalInterestPaid = 0;
  const totalPrincipal = debts.reduce((sum, d) => sum + d.balance, 0);

  while (debts.some(d => d.balance > 0) && month < 600) {
    month++;
    
    let orderedPending = orderDebts(debts.filter(d => d.balance > 0), method);
    
    // Calculate freed-up payments from already paid-off debts (the snowball/avalanche effect)
    const rolloverPayment = debts
      .filter(d => d.balance <= 0 && d.payoffMonth !== null)
      .reduce((sum, d) => sum + d.min_payment, 0);

    const totalExtraPayment = extraPayment + rolloverPayment;
    
    // Process payments for all debts
    for (const debt of debts) {
      if (debt.balance > 0) {
        const interest = (debt.balance * debt.rate) / 100 / 12;
        totalInterestPaid += interest;
        
        let payment = debt.min_payment;
        // If this is the target debt, add all extra payments to it
        if (orderedPending.length > 0 && debt.name === orderedPending[0].name) {
          payment += totalExtraPayment;
        }

        const principalPaid = payment - interest;
        const finalPayment = Math.min(debt.balance + interest, payment);
        debt.balance -= (finalPayment - interest);

        if (debt.balance <= 0 && debt.payoffMonth === null) {
          debt.balance = 0;
          debt.payoffMonth = month;
        }
      }
    }
  }

  const payoffSchedule = debts.map(d => ({
    name: d.name,
    payoffMonth: d.payoffMonth,
    totalPaid: (d.balance + totalPrincipal).toFixed(2), // Simplified for summary
  })).sort((a, b) => a.payoffMonth - b.payoffMonth);

  return {
    months: month,
    totalInterest: totalInterestPaid.toFixed(2),
    totalPrincipal: totalPrincipal.toFixed(2),
    payoffSchedule,
  };
}


// --- React Component ---

export default function DebtPayoffCalculatorStyled() {
  const [debts, setDebts] = useState([
    { name: 'Credit Card', balance: '10000', rate: '18.9', min_payment: '200' },
    { name: 'Car Loan', balance: '15000', rate: '4.5', min_payment: '350' },
    { name: 'Student Loan', balance: '25000', rate: '6.8', min_payment: '280' },
  ]);
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', min_payment: '' });
  const [extraPayment, setExtraPayment] = useState('200');
  const [results, setResults] = useState(null);

  const handleNewDebtChange = (e) => {
    setNewDebt({ ...newDebt, [e.target.name]: e.target.value });
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (newDebt.name && newDebt.balance && newDebt.rate && newDebt.min_payment) {
      setDebts([...debts, newDebt]);
      setNewDebt({ name: '', balance: '', rate: '', min_payment: '' });
    }
  };

  const removeDebt = (index) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    if (debts.length === 0) {
      setResults(null);
      return;
    }
    const snowballResults = simulatePayoff(debts, Number(extraPayment), 'Snowball');
    const avalancheResults = simulatePayoff(debts, Number(extraPayment), 'Avalanche');
    setResults({ snowball: snowballResults, avalanche: avalancheResults });
  };

  return (
    <div className="calculator-container">
      <h2>🚀 Debt Payoff Calculator</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Compare the Snowball and Avalanche methods to find the fastest way out of debt.
      </p>

      {/* --- Debt Input Table --- */}
      <div className="table-section">
        <h3>Your Debts</h3>
        <table>
          <thead>
            <tr>
              <th>Debt Name</th>
              <th>Current Balance ($)</th>
              <th>Interest Rate (%)</th>
              <th>Minimum Payment ($)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((debt, index) => (
              <tr key={index}>
                <td>{debt.name}</td>
                <td>{Number(debt.balance).toLocaleString()}</td>
                <td>{debt.rate}%</td>
                <td>{Number(debt.min_payment).toLocaleString()}</td>
                <td><button className="remove-btn" onClick={() => removeDebt(index)}>Remove</button></td>
              </tr>
            ))}
            {/* Form row to add new debt */}
            <tr>
              <td><input name="name" value={newDebt.name} onChange={handleNewDebtChange} placeholder="e.g., Personal Loan" /></td>
              <td><input type="number" name="balance" value={newDebt.balance} onChange={handleNewDebtChange} placeholder="e.g., 5000" /></td>
              <td><input type="number" name="rate" value={newDebt.rate} onChange={handleNewDebtChange} placeholder="e.g., 9.5" /></td>
              <td><input type="number" name="min_payment" value={newDebt.min_payment} onChange={handleNewDebtChange} placeholder="e.g., 150" /></td>
              <td><button className="add-btn" onClick={handleAddDebt}>Add Debt</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- Strategy & Calculation --- */}
      <div className="input-section">
        <div className="input-group">
          <label>Extra Monthly Payment ($)</label>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
          />
          <small>Additional amount to accelerate payoff.</small>
        </div>
        <button onClick={handleCalculate} className="calculate-btn">Calculate Payoff Plan</button>
      </div>

      {/* --- Results --- */}
      {results && (
        <>
          <div className="results-grid">
            {/* Snowball Summary */}
            <div className="result-card" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
              <h4>Debt Snowball</h4>
              <p className="result-value">{Math.floor(results.snowball.months / 12)}y {results.snowball.months % 12}m</p>
              <small>Total Interest: ${Number(results.snowball.totalInterest).toLocaleString()}</small>
            </div>

            {/* Avalanche Summary */}
            <div className="result-card" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
              <h4>Debt Avalanche</h4>
              <p className="result-value">{Math.floor(results.avalanche.months / 12)}y {results.avalanche.months % 12}m</p>
              <small>Total Interest: ${Number(results.avalanche.totalInterest).toLocaleString()}</small>
            </div>
          </div>
          
          <div className="results-grid">
            {/* Snowball Payoff Table */}
            <div className="table-section">
              <h3>Snowball Payoff Order</h3>
              <table>
                <thead>
                  <tr>
                    <th>Debt Name</th>
                    <th>Payoff Month</th>
                  </tr>
                </thead>
                <tbody>
                  {results.snowball.payoffSchedule.map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td style={{ fontWeight: 'bold' }}>{row.payoffMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Avalanche Payoff Table */}
            <div className="table-section">
              <h3>Avalanche Payoff Order</h3>
              <table>
                <thead>
                  <tr>
                    <th>Debt Name</th>
                    <th>Payoff Month</th>
                  </tr>
                </thead>
                <tbody>
                  {results.avalanche.payoffSchedule.map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td style={{ fontWeight: 'bold' }}>{row.payoffMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .calculator-container { max-width: 1000px; margin: auto; padding: 20px; font-family: sans-serif; }
        .input-section { display: flex; align-items: flex-end; gap: 20px; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .input-group { flex: 1; }
        .input-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        .input-group input, table input { width: 100%; box-sizing: border-box; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; }
        .input-group small { color: #666; font-size: 13px; }
        .calculate-btn, .add-btn, .remove-btn {
          padding: 12px 20px; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;
        }
        .calculate-btn { background: linear-gradient(135deg, #667eea, #764ba2); }
        .calculate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .add-btn { background: #28a745; width: 100%; }
        .remove-btn { background: #dc3545; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .result-card { padding: 25px; border-radius: 15px; color: white; text-align: center; }
        .result-value { font-size: 28px; font-weight: bold; margin: 10px 0; }
        .table-section { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #667eea; color: white; font-weight: 600; }
        tr:hover { background: #f9fafb; }
        td:last-child { text-align: center; }
      `}</style>
    </div>
  );
}
