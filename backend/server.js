const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://finance-assistant-website.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// PostgreSQL connection
// Force DATABASE_URL - no fallback
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set!');
  process.exit(1);
}

console.log('🔗 Connecting to database using DATABASE_URL');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.stack);
    console.error('❌ Please check your .env file settings!');
  } else {
    console.log('✅ Database connected successfully!');
    release();
  }
});

// Test query to verify tables exist
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database query test failed:', err);
  } else {
    console.log('✅ Database query test successful!');
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ============ AUTHENTICATION ROUTES ============

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Create default wallets for new user
    await pool.query(
      'INSERT INTO wallets (user_id, wallet_name, balance, currency) VALUES ($1, $2, 0, $3), ($1, $4, 0, $3), ($1, $5, 0, $3)',
      [user.id, 'Cash', 'INR', 'Savings Account', 'Credit Card']
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ PORTFOLIO ROUTES ============

// Get user portfolio
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add investment to portfolio
app.post('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const { asset_type, fund_name, amount, return_rate, tenure } = req.body;
    
    const result = await pool.query(
      'INSERT INTO investments (user_id, asset_type, fund_name, amount, return_rate, tenure) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, asset_type, fund_name, amount, return_rate, tenure]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding investment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete investment
app.delete('/api/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM investments WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ WALLET MANAGEMENT ROUTES ============

// Get user wallets
app.get('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create custom wallet
app.post('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const { wallet_name, balance, currency } = req.body;
    
    const result = await pool.query(
      'INSERT INTO wallets (user_id, wallet_name, balance, currency) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, wallet_name, balance || 0, currency || 'INR']
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Wallet with this name already exists' });
    } else {
      console.error('Error creating wallet:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update wallet balance
app.put('/api/wallets/:id', authenticateToken, async (req, res) => {
  try {
    const { balance } = req.body;
    
    const result = await pool.query(
      'UPDATE wallets SET balance = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [balance, req.params.id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete wallet
app.delete('/api/wallets/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wallets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Wallet deleted' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ TRANSACTIONS ROUTES ============

// Get user transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 100',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add transaction (ENHANCED VERSION - ONLY ONE)
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { date, amount, type, category, wallet, to_wallet, memo, currency } = req.body;
    
    console.log('📝 Received transaction:', req.body);
    
    // Insert transaction
    const result = await pool.query(
      'INSERT INTO transactions (user_id, date, amount, type, category, wallet, to_wallet, memo, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [req.user.id, date, amount, type, category, wallet, to_wallet || null, memo || null, currency || 'INR']
    );

    console.log('✅ Transaction saved to DB');

    // Update wallet balances
    if (type === 'Income') {
      await pool.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND wallet_name = $3',
        [amount, req.user.id, wallet]
      );
      console.log(`✅ Updated ${wallet}: +${amount}`);
    } else if (type === 'Expense') {
      await pool.query(
        'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND wallet_name = $3',
        [amount, req.user.id, wallet]
      );
      console.log(`✅ Updated ${wallet}: -${amount}`);
    } else if (type === 'Transfer' && to_wallet) {
      await pool.query(
        'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND wallet_name = $3',
        [amount, req.user.id, wallet]
      );
      await pool.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND wallet_name = $3',
        [amount, req.user.id, to_wallet]
      );
      console.log(`✅ Transfer: ${wallet} → ${to_wallet}: ${amount}`);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ============ DEBT MANAGER ROUTES ============

// Get user debts
app.get('/api/debts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM debts WHERE user_id = $1 ORDER BY interest_rate DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add debt
app.post('/api/debts', authenticateToken, async (req, res) => {
  try {
    const { debt_type, outstanding_principal, interest_rate, emi, emis_left } = req.body;
    
    const result = await pool.query(
      'INSERT INTO debts (user_id, debt_type, outstanding_principal, interest_rate, emi, emis_left) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, debt_type, outstanding_principal, interest_rate, emi, emis_left]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding debt:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CALCULATOR ROUTES ============

// SIP Calculator
app.post('/api/calculate/sip', (req, res) => {
  try {
    const { monthlyInvestment, returnRate, tenure } = req.body;
    
    const P = monthlyInvestment;
    const r = returnRate / 100 / 12;
    const n = tenure * 12;
    
    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = P * n;
    const wealthGain = futureValue - totalInvested;
    
    res.json({
      totalInvested: Math.round(totalInvested),
      maturityAmount: Math.round(futureValue),
      wealthGain: Math.round(wealthGain)
    });
  } catch (error) {
    res.status(500).json({ error: 'Calculation error' });
  }
});

// Lumpsum Calculator
app.post('/api/calculate/lumpsum', (req, res) => {
  try {
    const { initialInvestment, returnRate, tenure } = req.body;
    
    const futureValue = initialInvestment * Math.pow(1 + returnRate / 100, tenure);
    const wealthGain = futureValue - initialInvestment;
    
    res.json({
      futureValue: Math.round(futureValue),
      wealthGain: Math.round(wealthGain)
    });
  } catch (error) {
    res.status(500).json({ error: 'Calculation error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
