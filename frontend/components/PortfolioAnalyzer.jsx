import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PortfolioAnalyzer() {
  const { token } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [newInvestment, setNewInvestment] = useState({
    assetType: 'Index Fund',
    fundName: '',
    amount: 0,
    returnRate: 12,
    tenure: 10
  });
  const [viewMode, setViewMode] = useState('overview'); // overview, comparison, projections

  // Comprehensive asset categories with risk scores
  const assetCategories = {
    // Equity-based (High Risk)
    'Index Fund': { risk: 5, returnRange: '10-12%', category: 'Equity' },
    'Large Cap': { risk: 6, returnRange: '11-13%', category: 'Equity' },
    'Mid Cap': { risk: 7, returnRange: '13-15%', category: 'Equity' },
    'Small Cap': { risk: 8, returnRange: '15-18%', category: 'Equity' },
    
    // Debt-based (Low to Medium Risk)
    'Corporate Bonds': { risk: 3, returnRange: '7-9%', category: 'Debt' },
    'Government Bonds': { risk: 2, returnRange: '6-7%', category: 'Debt' },
    'Debt Fund': { risk: 3, returnRange: '6-8%', category: 'Debt' },
    'Liquid Fund': { risk: 1, returnRange: '4-5%', category: 'Debt' },
    
    // Alternatives
    'Gold': { risk: 4, returnRange: '6-7%', category: 'Alternative' },
    'REIT': { risk: 5, returnRange: '8-10%', category: 'Alternative' },
    'Commodities': { risk: 6, returnRange: '5-9%', category: 'Alternative' },
    'Crypto': { risk: 9, returnRange: '10-30%', category: 'Alternative' },
    
    // Cash/Savings
    'Emergency Fund': { risk: 1, returnRange: '3-4%', category: 'Cash' },
    'Fixed Deposit': { risk: 1, returnRange: '5-7%', category: 'Cash' }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      loadInvestments();
    }
  }, [token]);

  const loadInvestments = async () => {
    try {
      const response = await axios.get(`${API_URL}/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvestments(response.data);
      console.log('✅ Loaded investments:', response.data);
    } catch (error) {
      console.error('❌ Error loading investments:', error);
    }
  };

  const addInvestment = async () => {
    if (newInvestment.amount <= 0) {
      alert('⚠️ Please enter a valid amount');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/portfolio`, {
        asset_type: newInvestment.assetType,
        fund_name: newInvestment.fundName,
        amount: newInvestment.amount,
        return_rate: newInvestment.returnRate,
        tenure: newInvestment.tenure
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setInvestments([...investments, response.data]);
      alert('✅ Investment saved to database!');

      setNewInvestment({
        assetType: 'Index Fund',
        fundName: '',
        amount: 0,
        returnRate: 12,
        tenure: 10
      });
    } catch (error) {
      console.error('❌ Error saving:', error);
      alert('⚠️ Error: ' + (error.response?.data?.error || 'Could not save'));
    }
  };

  const deleteInvestment = async (id) => {
    if (!confirm('Delete this investment?')) return;

    try {
      await axios.delete(`${API_URL}/portfolio/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvestments(investments.filter(inv => inv.id !== id));
      alert('✅ Deleted from database!');
    } catch (error) {
      console.error('❌ Error deleting:', error);
    }
  };

  const calculatePortfolio = () => {
    if (investments.length === 0) return null;

    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    // Weighted average return
    const weightedReturn = investments.reduce((sum, inv) => 
      sum + (Number(inv.amount) * Number(inv.return_rate)), 0) / totalInvested;
    
    // Portfolio risk score
    const portfolioRisk = investments.reduce((sum, inv) => 
      sum + (Number(inv.amount) * assetCategories[inv.asset_type].risk), 0) / totalInvested;
    
    // Risk classification
    let riskCategory = 'Low Risk';
    let riskColor = '#10b981';
    if (portfolioRisk >= 7) {
      riskCategory = 'High Risk';
      riskColor = '#ef4444';
    } else if (portfolioRisk >= 4) {
      riskCategory = 'Moderate Risk';
      riskColor = '#f59e0b';
    }

    // Short-term projection (1-3 years, reduced returns)
    const shortTermYears = 3;
    const shortTermReturn = weightedReturn * 0.7; // 30% reduction for volatility
    const shortTermValue = investments.reduce((sum, inv) => {
      const r = (Number(inv.return_rate) * 0.7) / 100 / 12;
      const n = shortTermYears * 12;
      const fv = Number(inv.amount) * Math.pow(1 + r, n);
      return sum + fv;
    }, 0);

    // Long-term projection (10 years)
    const longTermYears = 10;
    const longTermValue = investments.reduce((sum, inv) => {
      const r = Number(inv.return_rate) / 100 / 12;
      const n = longTermYears * 12;
      const fv = Number(inv.amount) * Math.pow(1 + r, n);
      return sum + fv;
    }, 0);

    // Year-by-year growth projection
    const yearlyProjection = [];
    for (let year = 1; year <= 10; year++) {
      let yearTotal = investments.reduce((sum, inv) => {
        const r = Number(inv.return_rate) / 100 / 12;
        const n = year * 12;
        const fv = Number(inv.amount) * Math.pow(1 + r, n);
        return sum + fv;
      }, 0);
      
      yearlyProjection.push({
        year: year,
        value: Math.round(yearTotal),
        invested: totalInvested
      });
    }

    // Asset allocation by type
    const assetAllocation = investments.reduce((acc, inv) => {
      const existing = acc.find(a => a.name === inv.asset_type);
      if (existing) {
        existing.value += Number(inv.amount);
      } else {
        acc.push({ 
          name: inv.asset_type, 
          value: Number(inv.amount),
          percentage: 0
        });
      }
      return acc;
    }, []);

    // Calculate percentages
    assetAllocation.forEach(asset => {
      asset.percentage = ((asset.value / totalInvested) * 100).toFixed(1);
    });

    // Category-wise allocation (Equity vs Debt vs Alternative vs Cash)
    const categoryAllocation = investments.reduce((acc, inv) => {
      const category = assetCategories[inv.asset_type].category;
      const existing = acc.find(a => a.name === category);
      if (existing) {
        existing.value += Number(inv.amount);
      } else {
        acc.push({ name: category, value: Number(inv.amount) });
      }
      return acc;
    }, []);

    // Asset-wise returns for comparison
    const assetReturns = investments.map(inv => ({
      name: inv.fund_name || inv.asset_type,
      shortTerm: Math.round(Number(inv.amount) * Math.pow(1 + (Number(inv.return_rate) * 0.7 / 100 / 12), 36)),
      longTerm: Math.round(Number(inv.amount) * Math.pow(1 + (Number(inv.return_rate) / 100 / 12), 120))
    }));

    return {
      totalInvested,
      weightedReturn: weightedReturn.toFixed(2),
      portfolioRisk: portfolioRisk.toFixed(2),
      riskCategory,
      riskColor,
      shortTermValue: Math.round(shortTermValue),
      longTermValue: Math.round(longTermValue),
      shortTermReturn: shortTermReturn.toFixed(2),
      yearlyProjection,
      assetAllocation,
      categoryAllocation,
      assetReturns
    };
  };

  const portfolio = calculatePortfolio();

  return (
    <div className="portfolio-container">
      <h2>💼 Investment Portfolio Builder & Analyzer</h2>
      <p style={{textAlign: 'center', color: '#10b981', fontWeight: 'bold', marginBottom: '20px'}}>
        💾 Connected to PostgreSQL Database - Fully Persistent
      </p>

      {/* Navigation Tabs */}
      <div className="view-tabs" style={{display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center'}}>
        <button 
          onClick={() => setViewMode('overview')}
          style={{
            padding: '10px 20px',
            background: viewMode === 'overview' ? '#667eea' : '#e0e0e0',
            color: viewMode === 'overview' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setViewMode('comparison')}
          style={{
            padding: '10px 20px',
            background: viewMode === 'comparison' ? '#667eea' : '#e0e0e0',
            color: viewMode === 'comparison' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Comparison
        </button>
        <button 
          onClick={() => setViewMode('projections')}
          style={{
            padding: '10px 20px',
            background: viewMode === 'projections' ? '#667eea' : '#e0e0e0',
            color: viewMode === 'projections' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Projections
        </button>
      </div>
      
      {/* Add Investment Form */}
<div className="add-investment-form">
  <h3>Add New Investment</h3>
  
  <div className="form-group">
    <label htmlFor="assetType">Asset Type *</label>
    <select 
      id="assetType"
      value={newInvestment.assetType}
      onChange={(e) => setNewInvestment({...newInvestment, assetType: e.target.value})}
    >
      <optgroup label="📈 Equity (High Risk)">
        <option value="Index Fund">Index Fund (Risk: 5/10, Expected: 10-12%)</option>
        <option value="Large Cap">Large Cap Fund (Risk: 6/10, Expected: 11-13%)</option>
        <option value="Mid Cap">Mid Cap Fund (Risk: 7/10, Expected: 13-15%)</option>
        <option value="Small Cap">Small Cap Fund (Risk: 8/10, Expected: 15-18%)</option>
      </optgroup>
      <optgroup label="💰 Debt (Low-Medium Risk)">
        <option value="Corporate Bonds">Corporate Bonds (Risk: 3/10, Expected: 7-9%)</option>
        <option value="Government Bonds">Government Bonds (Risk: 2/10, Expected: 6-7%)</option>
        <option value="Debt Fund">Debt Fund (Risk: 3/10, Expected: 6-8%)</option>
        <option value="Liquid Fund">Liquid Fund (Risk: 1/10, Expected: 4-5%)</option>
      </optgroup>
      <optgroup label="🔄 Alternative">
        <option value="Gold">Gold (Risk: 4/10, Expected: 6-7%)</option>
        <option value="REIT">Real Estate Investment Trust (Risk: 5/10, Expected: 8-10%)</option>
        <option value="Commodities">Commodities (Risk: 6/10, Expected: 5-9%)</option>
        <option value="Crypto">Cryptocurrency (Risk: 9/10, Expected: 10-30%)</option>
      </optgroup>
      <optgroup label="💵 Cash & Savings">
        <option value="Emergency Fund">Emergency Fund (Risk: 1/10, Expected: 3-4%)</option>
        <option value="Fixed Deposit">Fixed Deposit (Risk: 1/10, Expected: 5-7%)</option>
      </optgroup>
    </select>
    <small style={{color: '#666', display: 'block', marginTop: '5px'}}>
      Selected: <strong>{newInvestment.assetType}</strong> - 
      Category: <strong>{assetCategories[newInvestment.assetType].category}</strong> - 
      Risk: <strong>{assetCategories[newInvestment.assetType].risk}/10</strong> - 
      Expected Returns: <strong>{assetCategories[newInvestment.assetType].returnRange}</strong>
    </small>
  </div>

  <div className="form-group">
    <label htmlFor="fundName">Fund/Scheme Name (Optional)</label>
    <input 
      id="fundName"
      type="text"
      placeholder="e.g., HDFC Index Fund, SBI Gold ETF"
      value={newInvestment.fundName}
      onChange={(e) => setNewInvestment({...newInvestment, fundName: e.target.value})}
    />
    <small style={{color: '#666'}}>Help you identify this investment later</small>
  </div>

  <div className="form-group">
    <label htmlFor="amount">Invested Amount (₹) *</label>
    <input 
      id="amount"
      type="number"
      placeholder="e.g., 50000"
      value={newInvestment.amount || ''}
      onChange={(e) => setNewInvestment({...newInvestment, amount: Number(e.target.value)})}
      min="1"
      required
    />
    <small style={{color: '#666'}}>Total amount you have invested in this asset</small>
  </div>

  <div className="form-group">
    <label htmlFor="returnRate">Expected Annual Return (%) *</label>
    <input 
      id="returnRate"
      type="number"
      placeholder="e.g., 12 (means 12% per year)"
      value={newInvestment.returnRate || ''}
      onChange={(e) => setNewInvestment({...newInvestment, returnRate: Number(e.target.value)})}
      step="0.5"
      min="0"
      max="100"
      required
    />
    <small style={{color: '#666'}}>
      💡 Suggested for {newInvestment.assetType}: <strong>{assetCategories[newInvestment.assetType].returnRange}</strong>
    </small>
  </div>

  <div className="form-group">
    <label htmlFor="tenure">Investment Duration (Years) *</label>
    <input 
      id="tenure"
      type="number"
      placeholder="e.g., 10 (how many years you'll hold)"
      value={newInvestment.tenure || ''}
      onChange={(e) => setNewInvestment({...newInvestment, tenure: Number(e.target.value)})}
      min="1"
      max="40"
      required
    />
    <small style={{color: '#666'}}>How long you plan to stay invested (1-40 years)</small>
  </div>

  <button 
    onClick={addInvestment} 
    className="add-btn"
    style={{marginTop: '10px'}}
  >
    💾 Add to Portfolio (Save to Database)
  </button>
</div>

<style jsx>{`
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 600;
    font-size: 15px;
  }

  .form-group small {
    display: block;
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.4;
  }

  optgroup {
    font-weight: bold;
    font-size: 14px;
    padding: 5px 0;
  }

  option {
    font-weight: normal;
    padding: 5px;
  }
`}</style>


      {/* Portfolio Display */}
      {investments.length > 0 ? (
        <>
          {/* Investment List */}
          <div className="investments-list">
            <h3>📊 Your Investments ({investments.length} Holdings)</h3>
            {investments.map(inv => (
              <div key={inv.id} className="investment-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong>{inv.asset_type}</strong>
                  {inv.fund_name && ` - ${inv.fund_name}`}
                  <br/>
                  <small style={{color: '#666'}}>
                    ₹{Number(inv.amount).toLocaleString()} | {inv.return_rate}% p.a. | {inv.tenure} years | 
                    Risk: {assetCategories[inv.asset_type]?.risk || 5}/10
                  </small>
                </div>
                <button 
                  onClick={() => deleteInvestment(inv.id)} 
                  style={{
                    padding: '8px 15px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>

          {/* Overview Mode */}
          {viewMode === 'overview' && portfolio && (
            <>
              <div className="portfolio-summary">
                <h3>📈 Portfolio Summary</h3>
                <div className="summary-cards">
                  <div className="summary-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                    <h4>Total Invested</h4>
                    <p style={{fontSize: '28px', fontWeight: 'bold'}}>₹{portfolio.totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="summary-card" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white'}}>
                    <h4>Weighted Avg Return</h4>
                    <p style={{fontSize: '28px', fontWeight: 'bold'}}>{portfolio.weightedReturn}% p.a.</p>
                  </div>
                  <div className="summary-card" style={{background: `linear-gradient(135deg, ${portfolio.riskColor} 0%, ${portfolio.riskColor}dd 100%)`, color: 'white'}}>
                    <h4>Risk Score</h4>
                    <p style={{fontSize: '28px', fontWeight: 'bold'}}>{portfolio.portfolioRisk}/10</p>
                    <small>{portfolio.riskCategory}</small>
                  </div>
                  <div className="summary-card" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white'}}>
                    <h4>Short-Term (3Y)</h4>
                    <p style={{fontSize: '28px', fontWeight: 'bold'}}>₹{portfolio.shortTermValue.toLocaleString()}</p>
                    <small>Expected Return: {portfolio.shortTermReturn}%</small>
                  </div>
                  <div className="summary-card" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white'}}>
                    <h4>Long-Term (10Y)</h4>
                    <p style={{fontSize: '28px', fontWeight: 'bold'}}>₹{portfolio.longTermValue.toLocaleString()}</p>
                    <small>Expected Return: {portfolio.weightedReturn}%</small>
                  </div>
                </div>
              </div>

              {/* Asset Allocation Pie Chart */}
              <div className="chart-section">
                <h3>🥧 Asset Allocation (By Type)</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={portfolio.assetAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolio.assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Allocation */}
              <div className="chart-section">
                <h3>📊 Portfolio Balance (Equity vs Debt vs Alternative vs Cash)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolio.categoryAllocation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#667eea" name="Investment Amount (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Comparison Mode */}
          {viewMode === 'comparison' && portfolio && (
            <div className="chart-section">
              <h3>📊 Asset-Wise Returns: Short-Term vs Long-Term</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={portfolio.assetReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="shortTerm" fill="#f59e0b" name="Short-Term (3 Years)" />
                  <Bar dataKey="longTerm" fill="#10b981" name="Long-Term (10 Years)" />
                </BarChart>
              </ResponsiveContainer>

              <div style={{marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '10px'}}>
                <h4>💡 Key Insights:</h4>
                <ul style={{lineHeight: '1.8'}}>
                  <li>Short-term returns are ~30% lower due to market volatility</li>
                  <li>Long-term investments benefit from compounding and reduced volatility</li>
                  <li>Your portfolio risk level: <strong style={{color: portfolio.riskColor}}>{portfolio.riskCategory}</strong></li>
                  <li>Diversification score: {investments.length >= 5 ? '✅ Well Diversified' : '⚠️ Consider more diversification'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Projections Mode */}
          {viewMode === 'projections' && portfolio && (
            <>
              <div className="chart-section">
                <h3>📈 10-Year Portfolio Growth Projection</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={portfolio.yearlyProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Portfolio Value (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="invested" stroke="#8884d8" strokeWidth={2} name="Amount Invested" />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} name="Projected Value" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="projection-table" style={{marginTop: '30px'}}>
                <h3>📅 Year-by-Year Breakdown</h3>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: '#667eea', color: 'white'}}>
                      <th style={{padding: '12px', textAlign: 'left'}}>Year</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Invested Amount</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Projected Value</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Gains</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.yearlyProjection.map((row, idx) => {
                      const gains = row.value - row.invested;
                      const returnPct = ((gains / row.invested) * 100).toFixed(2);
                      return (
                        <tr key={idx} style={{background: idx % 2 === 0 ? '#f9fafb' : 'white'}}>
                          <td style={{padding: '12px'}}>{row.year}</td>
                          <td style={{padding: '12px', textAlign: 'right'}}>₹{row.invested.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#10b981'}}>₹{row.value.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'right', color: gains > 0 ? '#10b981' : '#ef4444'}}>₹{gains.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'right'}}>{returnPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '10px'}}>
          <h3>📊 No Investments Yet</h3>
          <p style={{color: '#666', marginTop: '10px'}}>Start building your portfolio by adding your first investment above!</p>
        </div>
      )}
    </div>
  );
}
