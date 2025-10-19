-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  asset_type VARCHAR(100) NOT NULL,
  fund_name VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  return_rate DECIMAL(5, 2) NOT NULL,
  tenure INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (Money Tracker)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'Income', 'Expense', 'Transfer'
  category VARCHAR(100),
  wallet VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts table (ENHANCED Debt Manager structure)
CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  debt_type VARCHAR(100) NOT NULL,
  outstanding_principal DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  emi DECIMAL(15, 2) NOT NULL,
  emis_left INTEGER NOT NULL,
  min_payment DECIMAL(15, 2),                -- For credit cards, optional
  extra_monthly_payment DECIMAL(15, 2) DEFAULT 0, -- Extra payment, optional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taxation records
CREATE TABLE taxation_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,
  ltcg_equity DECIMAL(15, 2) DEFAULT 0,
  ltcg_debt DECIMAL(15, 2) DEFAULT 0,
  stcg_equity DECIMAL(15, 2) DEFAULT 0,
  section_80c_investments DECIMAL(15, 2) DEFAULT 0,
  total_tax_liability DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Posts (optional)
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
