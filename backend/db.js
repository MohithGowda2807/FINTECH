// backend/db.js

const { Pool } = require('pg');

// Create a new Pool instance.
// It will automatically look for the DATABASE_URL environment variable
// which your platform (Render) automatically provides for linked databases.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // This is often required for production environments like Render
    rejectUnauthorized: false 
  }
});

// Export the pool so other files (like debt.js) can use it
module.exports = pool;