import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, 
  Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MoneyTracker() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [viewMode, setViewMode] = useState('manage');
  const [csvData, setCsvData] = useState([]);
  const [showCsvAnalysis, setShowCsvAnalysis] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'Expense',
    category: '',
    wallet: '',
    to_wallet: '',
    memo: '',
    currency: 'INR'
  });

  const expenseCategories = [
    'BILLS', 'CLOTHING', 'EDUCATION', 'ENTERTAINMENT', 'FITNESS', 
    'FOOD', 'GIFTS', 'HEALTH', 'FURNITURE', 'PET', 
    'SHOPPING', 'TRANSPORTATION', 'TRAVEL', 'OTHERS'
  ];

  const incomeCategories = [
    'ALLOWANCE', 'AWARD', 'CASHBACKS', 'DIVIDEND', 'INVESTMENT',
    'LOTTERY', 'REFUNDS', 'SALARY', 'TIPS', 'OTHERS'
  ];

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

  const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6'];
  const INCOME_COLORS = ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      loadWallets();
      loadTransactions();
    }
  }, [token]);

  const loadWallets = async () => {
    try {
      const response = await axios.get(`${API_URL}/wallets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallets(response.data);
      
      if (response.data.length > 0 && !newTransaction.wallet) {
        setNewTransaction(prev => ({ ...prev, wallet: response.data[0].wallet_name }));
      }
    } catch (error) {
      console.error('❌ Error loading wallets:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    }
  };

  const addWallet = async () => {
    if (!newWalletName.trim()) {
      alert('⚠️ Please enter a wallet name');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/wallets`, {
        wallet_name: newWalletName,
        balance: 0,
        currency: 'INR'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setWallets([...wallets, response.data]);
      setNewWalletName('');
      setShowAddWallet(false);
      alert('✅ Wallet created successfully!');
    } catch (error) {
      alert('⚠️ ' + (error.response?.data?.error || 'Could not create wallet'));
    }
  };

  const deleteWallet = async (walletId) => {
    if (!confirm('Delete this wallet?')) return;

    try {
      await axios.delete(`${API_URL}/wallets/${walletId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWallets(wallets.filter(w => w.id !== walletId));
      alert('✅ Wallet deleted!');
    } catch (error) {
      alert('⚠️ Could not delete wallet');
    }
  };

  const addTransaction = async () => {
    if (!newTransaction.amount || newTransaction.amount <= 0) {
      alert('⚠️ Please enter a valid amount');
      return;
    }

    if (!newTransaction.category && newTransaction.type !== 'Transfer') {
      alert('⚠️ Please select a category');
      return;
    }

    if (newTransaction.type === 'Transfer' && !newTransaction.to_wallet) {
      alert('⚠️ Please select destination wallet for transfer');
      return;
    }

    if (newTransaction.type === 'Transfer' && newTransaction.wallet === newTransaction.to_wallet) {
      alert('⚠️ Source and destination wallets must be different');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/transactions`, newTransaction, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTransactions([response.data, ...transactions]);
      loadWallets();
      alert('✅ Transaction saved to database!');

      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'Expense',
        category: '',
        wallet: wallets[0]?.wallet_name || '',
        to_wallet: '',
        memo: '',
        currency: 'INR'
      });
    } catch (error) {
      console.error('❌ Error saving:', error);
      alert('⚠️ Error: ' + (error.response?.data?.error || 'Could not save'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAdvancedStats = () => {
    const incomeTransactions = transactions.filter(t => t.type === 'Income');
    const expenseTransactions = transactions.filter(t => t.type === 'Expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseByCategory = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const expensePieData = Object.keys(expenseByCategory).map(cat => ({
      name: cat,
      value: expenseByCategory[cat],
      percentage: ((expenseByCategory[cat] / totalExpense) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const incomeByCategory = incomeTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const incomePieData = Object.keys(incomeByCategory).map(cat => ({
      name: cat,
      value: incomeByCategory[cat],
      percentage: ((incomeByCategory[cat] / totalIncome) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === 'Income') {
        monthlyData[month].income += Number(t.amount);
      } else if (t.type === 'Expense') {
        monthlyData[month].expense += Number(t.amount);
      }
    });

    const trendData = Object.values(monthlyData).reverse().slice(0, 6).reverse();
    const top5Expenses = expensePieData.slice(0, 5);
    const top5Income = incomePieData.slice(0, 5);

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

    return { 
      totalIncome, 
      totalExpense, 
      expensePieData, 
      incomePieData,
      trendData,
      top5Expenses,
      top5Income,
      totalBalance,
      savingsRate
    };
  };

  const stats = calculateAdvancedStats();

  const handleCSVUpload = (event) => {
  const file = event.target.files[0];
  
  if (!file) return;

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    encoding: 'UTF-8',
    complete: (results) => {
      console.log('📊 CSV Parsed Data:', results.data);
      console.log('📋 Column Names:', results.meta.fields);
      
      if (!results.data || results.data.length === 0) {
        alert('⚠️ CSV file is empty or could not be parsed');
        return;
      }

      const transformedData = results.data.map((row, index) => {
        const dateValue = row.Date || row.date || row.DATE || 
                         row.Transaction_Date || row.TransactionDate || 
                         new Date().toISOString().split('T')[0];
        
        const amountValue = parseFloat(
          row.Amount || row.amount || row.AMOUNT || 
          row.Value || row.value || 0
        );
        
        const isExpense = amountValue < 0;
        const absoluteAmount = Math.abs(amountValue);
        
        let transactionType = row.Type || row.type || row.TYPE || '';
        if (!transactionType) {
          transactionType = isExpense ? 'Expense' : 'Income';
        }
        if (transactionType.toLowerCase() === 'transfer') {
          transactionType = 'Transfer';
        }
        
        const categoryValue = row.Category || row.category || row.CATEGORY || 
                             row.Tag || row.tag || 'OTHERS';
        
        const currencyValue = row.Currency || row.currency || row.CURRENCY || 'INR';
        
        const memoValue = row.Memo || row.memo || row.Description || 
                         row.description || row.Note || row.note || '';
        
        const walletValue = row.Wallet || row.wallet || row.Account || 
                           row.account || row.PaymentMode || 'Unknown';
        
        return {
          id: `csv-${index}`,
          date: dateValue,
          type: transactionType,
          category: categoryValue,
          amount: absoluteAmount,
          currency: currencyValue,
          memo: memoValue,
          wallet: walletValue,
          to_wallet: null
        };
      }).filter(t => t.amount > 0);

      if (transformedData.length === 0) {
        alert('⚠️ No valid transactions found in CSV. Please check the file format.');
        return;
      }

      setCsvData(transformedData);
      setShowCsvAnalysis(true);
      alert(`✅ Successfully imported ${transformedData.length} transactions from CSV!`);
      
      console.log('✅ Transformed Data:', transformedData.slice(0, 5));
    },
    error: (error) => {
      console.error('❌ CSV Parse Error:', error);
      alert('⚠️ Error parsing CSV file. Please check the format and try again.');
    }
  });
};

  const calculateCsvStats = () => {
    if (csvData.length === 0) return null;

    const incomeTransactions = csvData.filter(t => t.type === 'Income');
    const expenseTransactions = csvData.filter(t => t.type === 'Expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseByCategory = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const expensePieData = Object.keys(expenseByCategory).map(cat => ({
      name: cat,
      value: expenseByCategory[cat],
      percentage: ((expenseByCategory[cat] / totalExpense) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const incomeByCategory = incomeTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const incomePieData = Object.keys(incomeByCategory).map(cat => ({
      name: cat,
      value: incomeByCategory[cat],
      percentage: ((incomeByCategory[cat] / totalIncome) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    const monthlyData = {};
    csvData.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === 'Income') {
        monthlyData[month].income += Number(t.amount);
      } else if (t.type === 'Expense') {
        monthlyData[month].expense += Number(t.amount);
      }
    });

    const trendData = Object.values(monthlyData).reverse().slice(0, 6).reverse();
    const top5Expenses = expensePieData.slice(0, 5);
    const top5Income = incomePieData.slice(0, 5);

    return { 
      totalIncome, 
      totalExpense, 
      expensePieData, 
      incomePieData,
      trendData,
      top5Expenses,
      top5Income,
      savingsRate: totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0
    };
  };

  const csvStats = showCsvAnalysis ? calculateCsvStats() : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '12px 16px',
          border: '2px solid #0D9488',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          <p style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {payload[0].name}
          </p>
          <p style={{ color: '#0D9488', fontSize: '18px', fontWeight: 'bold' }}>
            ₹{payload[0].value.toLocaleString()}
          </p>
          {payload[0].payload.percentage && (
            <p style={{ color: '#666', fontSize: '14px' }}>
              {payload[0].payload.percentage}% of total
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glassCard money-tracker-container">
      <h2>💰 Money Manager</h2>
      <p style={{textAlign: 'center', color: '#0D9488', fontWeight: 'bold', marginBottom: '20px'}}>
        💾 Connected to Database - Fully Persistent with Custom Wallets
      </p>

      {/* View Mode Tabs */}
      <div style={{display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap'}}>
        {['manage', 'analytics', 'trends', 'import'].map(mode => (
          <button 
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '12px 24px',
              background: viewMode === mode ? 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)' : 'rgba(226, 232, 240, 0.8)',
              color: viewMode === mode ? 'white' : '#475569',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              textTransform: 'capitalize',
              transition: 'all 0.3s'
            }}
          >
            {mode === 'manage' && '📝'} 
            {mode === 'analytics' && '📊'} 
            {mode === 'trends' && '📈'} 
            {mode === 'import' && '📂'} 
            {' '}{mode}
          </button>
        ))}
      </div>

      {/* MANAGE MODE */}
      {viewMode === 'manage' && (
        <>
          <div className="wallet-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3>🏦 Your Wallets</h3>
              <button 
                onClick={() => setShowAddWallet(!showAddWallet)}
                style={{
                  padding: '8px 15px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ➕ Add New Wallet
              </button>
            </div>

            {showAddWallet && (
              <div style={{background: 'rgba(241, 245, 249, 0.6)', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(226, 232, 240, 0.8)'}}>
                <input
                  type="text"
                  placeholder="Enter wallet name (e.g., PayTM, Google Pay)"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  style={{width: '70%', marginRight: '10px'}}
                />
                <button onClick={addWallet} className="add-btn" style={{width: 'auto', padding: '10px 20px'}}>
                  Create Wallet
                </button>
              </div>
            )}

            <div className="wallets-grid">
              {wallets.map(wallet => (
                <div key={wallet.id} className="wallet-card">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                      <h4>{wallet.wallet_name}</h4>
                      <p className={Number(wallet.balance) >= 0 ? 'positive' : 'negative'}>
                        {wallet.currency} {Number(wallet.balance).toLocaleString()}
                      </p>
                    </div>
                    {!['Cash', 'Savings Account', 'Credit Card'].includes(wallet.wallet_name) && (
                      <button
                        onClick={() => deleteWallet(wallet.id)}
                        style={{
                          background: 'rgba(255,255,255,0.3)',
                          border: 'none',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="net-balance">
              <h3>Total Balance: ₹{stats.totalBalance.toLocaleString()}</h3>
            </div>
          </div>

          <div className="add-transaction-form">
            <h3>➕ Add New Transaction</h3>

            <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label>Date *</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>

              <div>
                <label>Type *</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value, category: ''})}
                >
                  <option value="Income">💰 Income</option>
                  <option value="Expense">💸 Expense</option>
                  <option value="Transfer">🔄 Transfer</option>
                </select>
              </div>
            </div>

            <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label>Amount *</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                />
              </div>

              <div>
                <label>Currency</label>
                <select
                  value={newTransaction.currency}
                  onChange={(e) => setNewTransaction({...newTransaction, currency: e.target.value})}
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            {newTransaction.type !== 'Transfer' && (
              <div>
                <label>Category *</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {(newTransaction.type === 'Expense' ? expenseCategories : incomeCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row" style={{display: 'grid', gridTemplateColumns: newTransaction.type === 'Transfer' ? '1fr 1fr' : '1fr', gap: '15px'}}>
              <div>
                <label>{newTransaction.type === 'Transfer' ? 'From Wallet *' : 'Wallet *'}</label>
                <select
                  value={newTransaction.wallet}
                  onChange={(e) => setNewTransaction({...newTransaction, wallet: e.target.value})}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.wallet_name}>{w.wallet_name}</option>
                  ))}
                </select>
              </div>

              {newTransaction.type === 'Transfer' && (
                <div>
                  <label>To Wallet *</label>
                  <select
                    value={newTransaction.to_wallet}
                    onChange={(e) => setNewTransaction({...newTransaction, to_wallet: e.target.value})}
                  >
                    <option value="">Select Destination</option>
                    {wallets.filter(w => w.wallet_name !== newTransaction.wallet).map(w => (
                      <option key={w.id} value={w.wallet_name}>{w.wallet_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label>Memo / Description</label>
              <textarea
                placeholder="Add notes about this transaction..."
                value={newTransaction.memo}
                onChange={(e) => setNewTransaction({...newTransaction, memo: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  minHeight: '80px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button onClick={addTransaction} className="add-btn">
              💾 Save Transaction to Database
            </button>
          </div>

          {transactions.length > 0 && (
            <div className="transactions-list">
              <h3>📝 Recent Transactions ({transactions.length} total)</h3>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)', color: 'white'}}>
                      <th style={{padding: '12px', textAlign: 'left'}}>Date</th>
                      <th style={{padding: '12px', textAlign: 'left'}}>Type</th>
                      <th style={{padding: '12px', textAlign: 'left'}}>Category</th>
                      <th style={{padding: '12px', textAlign: 'left'}}>Wallet</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Amount</th>
                      <th style={{padding: '12px', textAlign: 'left'}}>Memo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 20).map((t, idx) => (
                      <tr key={t.id} style={{background: idx % 2 === 0 ? 'rgba(241, 245, 249, 0.5)' : 'white', borderBottom: '1px solid #E2E8F0'}}>
                        <td style={{padding: '12px'}}>{formatDate(t.date)}</td>
                        <td style={{padding: '12px'}}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: t.type === 'Income' ? '#d1fae5' : t.type === 'Expense' ? '#fee2e2' : '#dbeafe',
                            color: t.type === 'Income' ? '#065f46' : t.type === 'Expense' ? '#991b1b' : '#1e40af'
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{padding: '12px'}}>{t.category || '-'}</td>
                        <td style={{padding: '12px'}}>
                          {t.type === 'Transfer' ? `${t.wallet} → ${t.to_wallet}` : t.wallet}
                        </td>
                        <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: t.type === 'Income' ? '#0D9488' : t.type === 'Expense' ? '#ef4444' : '#0891B2'}}>
                          {t.currency} {Number(t.amount).toLocaleString()}
                        </td>
                        <td style={{padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {t.memo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ANALYTICS MODE */}
      {viewMode === 'analytics' && transactions.length > 0 && (
        <>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)'}}>
              <h4 style={{fontSize: '14px', opacity: 0.9}}>💵 Total Income</h4>
              <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{stats.totalIncome.toLocaleString()}</p>
              <p style={{fontSize: '13px', opacity: 0.8}}>{transactions.filter(t => t.type === 'Income').length} transactions</p>
            </div>

            <div style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)'}}>
              <h4 style={{fontSize: '14px', opacity: 0.9}}>💸 Total Expense</h4>
              <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{stats.totalExpense.toLocaleString()}</p>
              <p style={{fontSize: '13px', opacity: 0.8}}>{transactions.filter(t => t.type === 'Expense').length} transactions</p>
            </div>

            <div style={{background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)'}}>
              <h4 style={{fontSize: '14px', opacity: 0.9}}>💰 Net Savings</h4>
              <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{(stats.totalIncome - stats.totalExpense).toLocaleString()}</p>
              <p style={{fontSize: '13px', opacity: 0.8}}>Savings Rate: {stats.savingsRate}%</p>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px'}}>
            {stats.expensePieData.length > 0 && (
              <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>💸 Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={stats.expensePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.percentage}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.expensePieData.map((entry, index) => (
                        <Cell key={`expense-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.incomePieData.length > 0 && (
              <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>💵 Income Sources</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={stats.incomePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.percentage}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.incomePieData.map((entry, index) => (
                        <Cell key={`income-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.top5Expenses.length > 0 && (
              <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>🔥 Top 5 Expenses</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.top5Expenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]}>
                      {stats.top5Expenses.map((entry, index) => (
                        <Cell key={`top-exp-${index}`} fill={EXPENSE_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {stats.top5Income.length > 0 && (
              <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>⭐ Top 5 Income</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.top5Income}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]}>
                      {stats.top5Income.map((entry, index) => (
                        <Cell key={`top-inc-${index}`} fill={INCOME_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* TRENDS MODE */}
      {viewMode === 'trends' && stats.trendData.length > 0 && (
        <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
          <h3 style={{textAlign: 'center', color: '#333', marginBottom: '25px', fontSize: '24px'}}>
            📊 Income vs Expense Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#0D9488" strokeWidth={3} dot={{ fill: '#0D9488', r: 5 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* IMPORT MODE - CSV */}
      {viewMode === 'import' && (
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h2 style={{color: '#333', marginBottom: '20px'}}>📂 Import CSV File for Analysis</h2>
            <p style={{color: '#666', marginBottom: '30px'}}>
              Upload your transaction CSV file from Money Manager Pro, Walnut, or any expense tracker
            </p>

            <div style={{
              border: '3px dashed #0D9488',
              borderRadius: '15px',
              padding: '40px',
              background: 'rgba(241, 245, 249, 0.6)',
              marginBottom: '20px'
            }}>
              <label htmlFor="csv-upload" style={{
                display: 'inline-block',
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)',
                color: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                📤 Choose CSV File
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{display: 'none'}}
              />
              <p style={{color: '#888', marginTop: '15px', fontSize: '14px'}}>
                Supported format: CSV with columns - Date, Type, Category, Amount, Currency, Memo, Wallet
              </p>
            </div>

            {csvData.length > 0 && (
              <div style={{
                background: '#0D9488',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                marginTop: '20px'
              }}>
                ✅ Successfully imported {csvData.length} transactions! Scroll down to see analysis.
              </div>
            )}
          </div>

          {showCsvAnalysis && csvStats && (
            <>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <div style={{background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)'}}>
                  <h4 style={{fontSize: '14px', opacity: 0.9}}>💵 Total Income (CSV)</h4>
                  <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{csvStats.totalIncome.toLocaleString()}</p>
                  <p style={{fontSize: '13px', opacity: 0.8}}>{csvData.filter(t => t.type === 'Income').length} transactions</p>
                </div>

                <div style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)'}}>
                  <h4 style={{fontSize: '14px', opacity: 0.9}}>💸 Total Expense (CSV)</h4>
                  <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{csvStats.totalExpense.toLocaleString()}</p>
                  <p style={{fontSize: '13px', opacity: 0.8}}>{csvData.filter(t => t.type === 'Expense').length} transactions</p>
                </div>

                <div style={{background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)', padding: '25px', borderRadius: '15px', color: 'white', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)'}}>
                  <h4 style={{fontSize: '14px', opacity: 0.9}}>💰 Net Savings (CSV)</h4>
                  <p style={{fontSize: '32px', fontWeight: 'bold', margin: '10px 0'}}>₹{(csvStats.totalIncome - csvStats.totalExpense).toLocaleString()}</p>
                  <p style={{fontSize: '13px', opacity: 0.8}}>Savings Rate: {csvStats.savingsRate}%</p>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px'}}>
                {csvStats.expensePieData.length > 0 && (
                  <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                    <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>💸 CSV Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={csvStats.expensePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name} (${entry.percentage}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {csvStats.expensePieData.map((entry, index) => (
                            <Cell key={`csv-expense-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {csvStats.incomePieData.length > 0 && (
                  <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                    <h3 style={{textAlign: 'center', color: '#333', marginBottom: '20px'}}>💵 CSV Income Sources</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={csvStats.incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name} (${entry.percentage}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {csvStats.incomePieData.map((entry, index) => (
                            <Cell key={`csv-income-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {csvStats.trendData.length > 0 && (
                <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
                  <h3 style={{textAlign: 'center', color: '#333', marginBottom: '25px', fontSize: '24px'}}>
                    📊 CSV Data: Monthly Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={csvStats.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#0D9488" strokeWidth={3} dot={{ fill: '#0D9488', r: 5 }} name="Income" />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} name="Expense" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'}}>
                <h3 style={{marginBottom: '20px'}}>📋 Imported CSV Transactions ({csvData.length})</h3>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)', color: 'white'}}>
                        <th style={{padding: '12px', textAlign: 'left'}}>Date</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Type</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Category</th>
                        <th style={{padding: '12px', textAlign: 'right'}}>Amount</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Wallet</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Memo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 50).map((t, idx) => (
                        <tr key={t.id} style={{background: idx % 2 === 0 ? 'rgba(241, 245, 249, 0.5)' : 'white', borderBottom: '1px solid #E2E8F0'}}>
                          <td style={{padding: '12px'}}>{formatDate(t.date)}</td>
                          <td style={{padding: '12px'}}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: t.type === 'Income' ? '#d1fae5' : '#fee2e2',
                              color: t.type === 'Income' ? '#065f46' : '#991b1b'
                            }}>
                              {t.type}
                            </span>
                          </td>
                          <td style={{padding: '12px'}}>{t.category}</td>
                          <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: t.type === 'Income' ? '#0D9488' : '#ef4444'}}>
                            {t.currency} {Number(t.amount).toLocaleString()}
                          </td>
                          <td style={{padding: '12px'}}>{t.wallet}</td>
                          <td style={{padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {t.memo || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
