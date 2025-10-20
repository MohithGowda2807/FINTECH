const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // Use the .js file extension

// Create Debt
router.post('/', async (req, res) => {
  const { user_id, debt_type, principal, interest_rate, emi, tenure_months, min_payment, extra_monthly_payment } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO debts (user_id, debt_type, principal, interest_rate, emi, tenure_months, min_payment, extra_monthly_payment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [user_id, debt_type, principal, interest_rate, emi, tenure_months, min_payment, extra_monthly_payment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Debts for a User
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const result = await pool.query(`SELECT * FROM debts WHERE user_id = $1`, [user_id]);
  res.json(result.rows);
});

module.exports = router;
