import React, { useState } from 'react';

// Helper: EMIs for amortized loans
function calculateEMI(P, rate, n) {
  const r = rate / 12 / 100;
  if (n <= 0 || r === 0) return 0;
  return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

// Strategy ordering
function orderDebts(debts, method) {
  if (method === 'Avalanche') {
    return debts.slice().sort((a, b) => b.interest_rate - a.interest_rate);
  }
  if (method === 'Snowball') {
    return debts.slice().sort((a, b) => a.principal - b.principal);
  }
  return debts;
}

// CORRECTED amortization simulation
function simulatePayoff(debts, extra, method, fixedTotal) {
  // Create a deep copy to mutate, and add tracking properties
  const debtsCopy = debts.map(d => ({
    ...d,
    principal: Number(d.principal),
    originalMinPayment: Number(d.min_payment) || Number(d.emi) || 0,
    payoffMonth: null,
  }));

  let month = 0;
  let totalInterest = 0;

  // Loop as long as there are debts with a balance, with a 50-year safety limit
  while (debtsCopy.some(d => d.principal > 0) && month < 600) {
    month++;

    let extraPaymentPool = Number(extra) || 0;
    // If using fixed payments, add the minimum payments of already paid-off debts to the extra pool (the "snowball")
    if (fixedTotal) {
      extraPaymentPool += debtsCopy
        .filter(d => d.principal === 0)
        .reduce((sum, d) => sum + d.originalMinPayment, 0);
    }

    const pendingDebts = debtsCopy.filter(d => d.principal > 0);
    const orderedPendingDebts = orderDebts(pendingDebts, method);

    // Process payments for each pending debt
    for (const debt of pendingDebts) {
      const monthlyInterest = debt.principal * (debt.interest_rate / 100 / 12);
      totalInterest += monthlyInterest;
      debt.principal += monthlyInterest; // Accrue interest first

      let payment = debt.originalMinPayment;

      // If this is the target debt, add the entire extra pool to its payment
      if (orderedPendingDebts.length > 0 && debt === orderedPendingDebts[0]) {
        payment += extraPaymentPool;
      }

      // Ensure payment is not more than what is owed
      const finalPayment = Math.min(payment, debt.principal);
      debt.principal -= finalPayment;

      // If paid off, mark the month and clean up any tiny remaining balance
      if (debt.principal <= 0 && debt.payoffMonth === null) {
        debt.principal = 0;
        debt.payoffMonth = month;
      }
    }
  }

  // Create the final schedule from the completed simulation
  const schedule = debtsCopy.map(d => ({
    debt: d.debt_type,
    payoffMonth: d.payoffMonth || 'Not paid',
    remaining: d.principal.toFixed(2),
  }));

  return {
    months: month,
    totalInterest: totalInterest.toFixed(2),
    schedule,
  };
}


function DebtManager() {
  // Input state for debts and new debt row
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    debt_type: '',
    principal: '',
    interest_rate: '',
    min_payment: '',
    emi: '',
    tenure_months: ''
  });
  const [extraMonthly, setExtraMonthly] = useState('');
  const [repaymentMethod, setRepaymentMethod] = useState('Avalanche');
  const [fixedPayment, setFixedPayment] = useState(true);
  const [results, setResults] = useState(null);

  // Handle input change for newDebt
  const handleDebtChange = e => setNewDebt({ ...newDebt, [e.target.name]: e.target.value });

  // Add debt to the table
  const handleAddDebt = e => {
    e.preventDefault();
    if (!newDebt.debt_type || !newDebt.principal) return;
    setDebts([...debts, { ...newDebt, principal: Number(newDebt.principal), interest_rate: Number(newDebt.interest_rate), min_payment: Number(newDebt.min_payment), emi: Number(newDebt.emi), tenure_months: Number(newDebt.tenure_months) }]);
    setNewDebt({
      debt_type: '',
      principal: '',
      interest_rate: '',
      min_payment: '',
      emi: '',
      tenure_months: ''
    });
  };

  // Remove a debt row
  const removeDebt = index => setDebts(debts.filter((_, i) => i !== index));

  // Run calculation on button click
  const calculateSchedule = () => {
    const res = simulatePayoff(
      debts.map(d => ({ ...d })),
      extraMonthly,
      repaymentMethod,
      fixedPayment
    );
    setResults(res);
  };

  return (
    <div style={{ maxWidth: 900, margin: '48px auto', padding: 24, background: 'white', borderRadius: 10 }}>
      <h2>Debt Payoff Manager</h2>
      <form onSubmit={handleAddDebt}>
        <table style={{ width: '100%', marginBottom: 24, borderSpacing: 8 }}>
          <thead>
            <tr>
              <th>Debt Name</th>
              <th>Balance</th>
              <th>Interest&nbsp;%</th>
              <th>Min Payment</th>
              <th>EMI (if loan)</th>
              <th>Months</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d, idx) => (
              <tr key={idx}>
                <td>{d.debt_type}</td>
                <td>₹{d.principal}</td>
                <td>{d.interest_rate}%</td>
                <td>₹{d.min_payment}</td>
                <td>₹{d.emi}</td>
                <td>{d.tenure_months}</td>
                <td>
                  <button type="button" onClick={() => removeDebt(idx)}>Remove</button>
                </td>
              </tr>
            ))}
            <tr>
              <td><input name="debt_type" value={newDebt.debt_type} onChange={handleDebtChange} required /></td>
              <td><input name="principal" value={newDebt.principal} type="number" min="1" onChange={handleDebtChange} required /></td>
              <td><input name="interest_rate" value={newDebt.interest_rate} type="number" min="0" onChange={handleDebtChange} required /></td>
              <td><input name="min_payment" value={newDebt.min_payment} type="number" min="0" onChange={handleDebtChange} /></td>
              <td><input name="emi" value={newDebt.emi} type="number" min="0" onChange={handleDebtChange} /></td>
              <td><input name="tenure_months" value={newDebt.tenure_months} type="number" min="0" onChange={handleDebtChange} /></td>
              <td><button type="submit">Add</button></td>
            </tr>
          </tbody>
        </table>
      </form>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <label>
          Extra Monthly Payment:
          <input type="number" value={extraMonthly} onChange={e => setExtraMonthly(e.target.value)} style={{ width: 80, marginLeft: 8 }} />
        </label>
        <label>
          Strategy:
          <select value={repaymentMethod} onChange={e => setRepaymentMethod(e.target.value)}>
            <option value="Avalanche">Avalanche (Highest Interest)</option>
            <option value="Snowball">Snowball (Smallest Balance)</option>
          </select>
        </label>
        <label>
          Fixed total monthly payment?
          <input type="checkbox" checked={fixedPayment} onChange={e => setFixedPayment(e.target.checked)} style={{ marginLeft: 8 }} />
        </label>
        <button onClick={calculateSchedule} style={{ marginLeft: 12 }}>Calculate</button>
      </div>

      {results && (
        <div>
          <h3>Repayment Plan Summary</h3>
          <div>
            <strong>Months to Debt-Free:</strong> {results.months}
          </div>
          <div>
            <strong>Total Interest Paid:</strong> ₹{results.totalInterest}
          </div>
          <table style={{ width: '100%', marginTop: 18, borderSpacing: 4 }}>
            <thead>
              <tr>
                <th>Debt</th>
                <th>Payoff Month</th>
                <th>Balance Remaining</th>
              </tr>
            </thead>
            <tbody>
              {results.schedule.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.debt}</td>
                  <td>{row.payoffMonth}</td>
                  <td>₹{row.remaining}</td>
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
