import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- Reusable Modal Component ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Notification Component ---
const Notification = ({ message }) => {
  if (!message) return null;
  return <div className="notification">{message}</div>;
};


export default function PortfolioAnalyzer() {
  const { token } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [newInvestment, setNewInvestment] = useState({
    asset_type: 'Index Fund',
    fund_name: '',
    amount: '',
    return_rate: 12,
    tenure: 10
  });
  
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  const [modal, setModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [notification, setNotification] = useState('');

  const addFormRef = useRef(null);

  const assetCategories = {
    'Index Fund': { risk: 5, returnRange: '10-12%', category: 'Equity' }, 'Large Cap': { risk: 6, returnRange: '11-13%', category: 'Equity' }, 'Mid Cap': { risk: 7, returnRange: '13-15%', category: 'Equity' }, 'Small Cap': { risk: 8, returnRange: '15-18%', category: 'Equity' }, 'Corporate Bonds': { risk: 3, returnRange: '7-9%', category: 'Debt' }, 'Government Bonds': { risk: 2, returnRange: '6-7%', category: 'Debt' }, 'Debt Fund': { risk: 3, returnRange: '6-8%', category: 'Debt' }, 'Liquid Fund': { risk: 1, returnRange: '4-5%', category: 'Debt' }, 'Gold': { risk: 4, returnRange: '6-7%', category: 'Alternative' }, 'REIT': { risk: 5, returnRange: '8-10%', category: 'Alternative' }, 'Commodities': { risk: 6, returnRange: '5-9%', category: 'Alternative' }, 'Crypto': { risk: 9, returnRange: '10-30%', category: 'Alternative' }, 'Emergency Fund': { risk: 1, returnRange: '3-4%', category: 'Cash' }, 'Fixed Deposit': { risk: 1, returnRange: '5-7%', category: 'Cash' }
  };
  const COLORS = ['#0D47A1', '#1565C0', '#D4AF37', '#F4D03F', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9'];
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
  
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const showModal = (message, onConfirm) => {
    setModal({ isOpen: true, message, onConfirm });
  };
  
  const hideModal = () => {
    setModal({ isOpen: false, message: '', onConfirm: null });
  };


  useEffect(() => {
    if (token) loadInvestments();
  }, [token]);

  const loadInvestments = async () => {
    try {
      const response = await axios.get(`${API_URL}/portfolio`, { headers: { 'Authorization': `Bearer ${token}` } });
      setInvestments(response.data);
    } catch (error) {
      console.error('❌ Error loading investments:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingInvestment) {
      await updateInvestment();
    } else {
      await addInvestment();
    }
  };

  const addInvestment = async () => {
    if (newInvestment.amount <= 0) {
      showNotification('⚠️ Please enter a valid amount');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/portfolio`, newInvestment, { headers: { 'Authorization': `Bearer ${token}` } });
      setInvestments([...investments, response.data]);
      showNotification('✅ Investment added successfully!');
      resetForm();
    } catch (error) {
      showNotification('⚠️ Error: ' + (error.response?.data?.error || 'Could not save'));
    }
  };
  
  const updateInvestment = async () => {
    try {
        // --- FIX STARTS HERE ---
        // Create a complete object to send to the API.
        // This merges the original investment data (including the 'id') 
        // with the new data from the form.
        const investmentToUpdate = { ...editingInvestment, ...newInvestment };
        // --- FIX ENDS HERE ---

        const response = await axios.put(
            `${API_URL}/portfolio/${editingInvestment.id}`, 
            investmentToUpdate, // Send the complete object
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setInvestments(investments.map(inv => (inv.id === editingInvestment.id ? response.data : inv)));
        showNotification('✅ Investment updated successfully!');
        resetForm();
    } catch (error) {
        showNotification('⚠️ Error: ' + (error.response?.data?.error || 'Could not update'));
    }
  };

  const deleteInvestment = async (id) => {
      const handleConfirm = async () => {
        try {
            await axios.delete(`${API_URL}/portfolio/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setInvestments(investments.filter(inv => inv.id !== id));
            showNotification('✅ Investment deleted successfully!');
            hideModal();
        } catch (error) {
            showNotification('⚠️ Error deleting investment.');
            hideModal();
        }
      };
      showModal('Are you sure you want to delete this investment?', handleConfirm);
  };

  const startEdit = (investment) => {
    setEditingInvestment(investment);
    setNewInvestment({
        asset_type: investment.asset_type,
        fund_name: investment.fund_name,
        amount: investment.amount,
        return_rate: investment.return_rate,
        tenure: investment.tenure,
    });
    addFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingInvestment(null);
    setNewInvestment({ asset_type: 'Index Fund', fund_name: '', amount: '', return_rate: 12, tenure: 10 });
  };
  
  const groupedInvestments = useMemo(() => {
    return investments.reduce((acc, inv) => {
        const key = inv.asset_type;
        if (!acc[key]) {
            acc[key] = { totalAmount: 0, history: [] };
        }
        acc[key].totalAmount += Number(inv.amount);
        acc[key].history.push(inv);
        return acc;
    }, {});
  }, [investments]);
  
  const toggleExpand = (groupKey) => {
      setExpandedGroup(expandedGroup === groupKey ? null : groupKey);
  };


  const calculatePortfolio = () => {
    if (investments.length === 0) return null;
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const weightedReturn = investments.reduce((sum, inv) => sum + (Number(inv.amount) * Number(inv.return_rate)), 0) / totalInvested;
    const portfolioRisk = investments.reduce((sum, inv) => sum + (Number(inv.amount) * assetCategories[inv.asset_type].risk), 0) / totalInvested;
    let riskCategory = 'Low Risk', riskColor = '#10b981';
    if (portfolioRisk >= 7) { riskCategory = 'High Risk'; riskColor = '#ef4444'; } else if (portfolioRisk >= 4) { riskCategory = 'Moderate Risk'; riskColor = '#f59e0b'; }
    const longTermValue = investments.reduce((sum, inv) => sum + (Number(inv.amount) * Math.pow(1 + Number(inv.return_rate) / 100, 10)), 0);
    const yearlyProjection = Array.from({ length: 10 }, (_, i) => i + 1).map(year => ({
      year,
      value: Math.round(investments.reduce((sum, inv) => sum + (Number(inv.amount) * Math.pow(1 + Number(inv.return_rate) / 100, year)), 0)),
      invested: totalInvested,
    }));
    const categoryAllocation = investments.reduce((acc, inv) => {
      const category = assetCategories[inv.asset_type].category;
      const existing = acc.find(a => a.name === category);
      if (existing) { existing.value += Number(inv.amount); } else { acc.push({ name: category, value: Number(inv.amount) }); }
      return acc;
    }, []);
    return {
      totalInvested, weightedReturn: weightedReturn.toFixed(2), portfolioRisk: portfolioRisk.toFixed(2), riskCategory, riskColor, longTermValue: Math.round(longTermValue), yearlyProjection, categoryAllocation,
      assetAllocation: Object.entries(groupedInvestments).map(([name, { totalAmount }]) => ({ name, value: totalAmount }))
    };
  };

  const portfolio = calculatePortfolio();

  return (
    <div className="portfolio-container">
      <Notification message={notification} />
      <ConfirmationModal isOpen={modal.isOpen} message={modal.message} onConfirm={modal.onConfirm} onCancel={hideModal} />

      <h2>💼 Investment Portfolio Builder & Analyzer</h2>
      
      <div ref={addFormRef} className="add-investment-form">
        <h3>{editingInvestment ? '📝 Edit Investment' : '➕ Add New Investment'}</h3>
        <form onSubmit={handleFormSubmit}>
            <div className="form-group">
                <label>Asset Type *</label>
                <select value={newInvestment.asset_type} onChange={(e) => setNewInvestment({...newInvestment, asset_type: e.target.value})}>
                     <optgroup label="📈 Equity (High Risk)">
                        <option value="Index Fund">Index Fund</option> <option value="Large Cap">Large Cap Fund</option> <option value="Mid Cap">Mid Cap Fund</option> <option value="Small Cap">Small Cap Fund</option>
                     </optgroup>
                     <optgroup label="💰 Debt (Low-Medium Risk)">
                        <option value="Corporate Bonds">Corporate Bonds</option> <option value="Government Bonds">Government Bonds</option> <option value="Debt Fund">Debt Fund</option> <option value="Liquid Fund">Liquid Fund</option>
                     </optgroup>
                     <optgroup label="🔄 Alternative">
                        <option value="Gold">Gold</option> <option value="REIT">REIT</option> <option value="Commodities">Commodities</option> <option value="Crypto">Cryptocurrency</option>
                     </optgroup>
                     <optgroup label="💵 Cash & Savings">
                        <option value="Emergency Fund">Emergency Fund</option> <option value="Fixed Deposit">Fixed Deposit</option>
                     </optgroup>
                </select>
            </div>
            <div className="form-group-row">
                <div className="form-group">
                    <label>Fund/Scheme Name (Optional)</label>
                    <input type="text" placeholder="e.g., HDFC Index Fund" value={newInvestment.fund_name} onChange={(e) => setNewInvestment({...newInvestment, fund_name: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Invested Amount (₹) *</label>
                    <input type="number" placeholder="50000" value={newInvestment.amount} onChange={(e) => setNewInvestment({...newInvestment, amount: Number(e.target.value)})} min="1" required />
                </div>
            </div>
            <div className="form-group-row">
                <div className="form-group">
                    <label>Expected Annual Return (%) *</label>
                    <input type="number" placeholder="12" value={newInvestment.return_rate} onChange={(e) => setNewInvestment({...newInvestment, return_rate: Number(e.target.value)})} step="0.5" required />
                </div>
                <div className="form-group">
                    <label>Investment Duration (Years) *</label>
                    <input type="number" placeholder="10" value={newInvestment.tenure} onChange={(e) => setNewInvestment({...newInvestment, tenure: Number(e.target.value)})} min="1" required />
                </div>
            </div>
            <div className="form-actions">
                <button type="submit" className="add-btn">
                    {editingInvestment ? '💾 Save Changes' : '➕ Add to Portfolio'}
                </button>
                {editingInvestment && <button type="button" onClick={resetForm} className="cancel-btn">Cancel Edit</button>}
            </div>
        </form>
      </div>

      {investments.length > 0 ? (
        <>
            <div className="investments-list">
                <h3>📊 Your Holdings ({Object.keys(groupedInvestments).length} Asset Types)</h3>
                {Object.entries(groupedInvestments).map(([assetType, group]) => (
                    <div key={assetType} className="investment-group">
                        <div className="group-summary" onClick={() => toggleExpand(assetType)}>
                            <div>
                                <strong>{assetType}</strong>
                                <span className="pill">{group.history.length} transaction{group.history.length > 1 ? 's' : ''}</span>
                            </div>
                            <div>
                                <span>Total: ₹{group.totalAmount.toLocaleString()}</span>
                                <span className="chevron">{expandedGroup === assetType ? '▲' : '▼'}</span>
                            </div>
                        </div>
                        {expandedGroup === assetType && (
                            <div className="group-history">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name/Scheme</th>
                                            <th>Amount</th>
                                            <th>Return</th>
                                            <th>Tenure</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.history.map(inv => (
                                            <tr key={inv.id}>
                                                <td>{inv.fund_name || 'N/A'}</td>
                                                <td>₹{Number(inv.amount).toLocaleString()}</td>
                                                <td>{inv.return_rate}%</td>
                                                <td>{inv.tenure} yrs</td>
                                                <td>
                                                    <button onClick={() => startEdit(inv)} className="btn-edit">Edit</button>
                                                    <button onClick={() => deleteInvestment(inv.id)} className="btn-delete">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          
            <div className="portfolio-summary">
                <h3>📈 Portfolio Summary</h3>
                <div className="summary-cards">
                    <div className="summary-card"><h4>Total Invested</h4><p>₹{portfolio.totalInvested.toLocaleString()}</p></div>
                    <div className="summary-card"><h4>Avg. Return</h4><p>{portfolio.weightedReturn}%</p></div>
                    <div className="summary-card" style={{'--risk-color': portfolio.riskColor}}><h4>Risk Score</h4><p>{portfolio.portfolioRisk}/10</p><small>{portfolio.riskCategory}</small></div>
                    <div className="summary-card"><h4>10Y Projection</h4><p>₹{portfolio.longTermValue.toLocaleString()}</p></div>
                </div>
            </div>
          
            <div className="chart-section">
              <h3>🥧 Asset Allocation</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={portfolio.assetAllocation} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                    {portfolio.assetAllocation.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>📊 No Investments Yet</h3>
          <p>Start building your portfolio by adding your first investment above!</p>
        </div>
      )}
      <style jsx>{`
        .portfolio-container { max-width: 900px; margin: auto; }
        .add-investment-form { background: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .form-group, .form-group-row { margin-bottom: 20px; }
        .form-group-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; }
        input, select { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; }
        .form-actions { display: flex; gap: 10px; margin-top: 10px; }
        .add-btn, .cancel-btn { flex-grow: 1; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
        .add-btn { background: linear-gradient(135deg, #0D47A1, #1565C0); color: white; }
        .cancel-btn { background: #e0e0e0; color: #333; }
        
        .investments-list { margin-bottom: 30px; }
        .investment-group { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 15px; }
        .group-summary { display: flex; justify-content: space-between; align-items: center; padding: 15px; cursor: pointer; }
        .group-summary strong { font-size: 1.1rem; }
        .pill { background: #eef2ff; color: #4338ca; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; margin-left: 10px; }
        .chevron { margin-left: 15px; font-size: 1.2rem; color: #667eea; }
        .group-history { padding: 0 15px 15px; }
        .group-history table { width: 100%; border-collapse: collapse; }
        .group-history th, .group-history td { text-align: left; padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .group-history th { font-size: 0.8rem; color: #64748b; }
        .btn-edit, .btn-delete { padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px; }
        .btn-edit { background: #f59e0b; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        
        .portfolio-summary { margin-bottom: 30px; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .summary-card h4 { margin: 0 0 10px; color: #555; }
        .summary-card p { font-size: 1.8rem; font-weight: bold; margin: 5px 0; color: #667eea; }
        .summary-card[style*="--risk-color"] p { color: var(--risk-color); }
        
        .chart-section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); margin-top: 30px; }
        .empty-state { text-align: center; padding: 40px; background: #f9fafb; border-radius: 12px; }
        
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #22c55e; color: white; padding: 12px 25px; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: fadeInOut 3s forwards; }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -20px); } 10% { opacity: 1; transform: translate(-50%, 0); } 90% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }

        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center; }
        .modal-actions { display: flex; justify-content: center; gap: 15px; margin-top: 20px; }
        .btn-secondary, .btn-danger { padding: 10px 25px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
        .btn-secondary { background: #e0e0e0; color: #333; }
        .btn-danger { background: #ef4444; color: white; }
      `}</style>
    </div>
  );
}
