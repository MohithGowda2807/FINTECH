const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const pool = require("../db/pool");
const path = require("path");

// Predict Expenses using Python ML
router.post("/predict-expenses", async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch LAST 200 transactions (ordered by date ASC)
    const result = await pool.query(
      "SELECT date, amount, type, category FROM transactions WHERE user_id=$1 ORDER BY date ASC LIMIT 200",
      [userId]
    );

    const transactions = result.rows;

    if (transactions.length < 30) {
      return res.json({
        success: false,
        message: "You need at least 30 expense transactions for AI prediction."
      });
    }

    // Run Python Script
    const pythonScript = spawn("python", [
      path.join(__dirname, "../ml/expense_predictor.py"),
      JSON.stringify(transactions)
    ]);

    let output = "";
    pythonScript.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonScript.stderr.on("data", (data) => {
      console.error("⚠️ Python Error:", data.toString());
    });

    pythonScript.on("close", () => {
      try {
        res.json(JSON.parse(output));
      } catch (err) {
        res.status(500).json({ success: false, message: "ML output parse error" });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Backend server failed" });
  }
});

module.exports = router;
