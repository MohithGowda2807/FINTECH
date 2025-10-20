import React, { useState } from "react";

export default function Taxation() {
  const [inputs, setInputs] = useState({
    assessmentYear: "2025-26",
    ageCategory: "Below 60",
    grossSalary: 0,
    otherIncome: 0,
    interestIncome: 0,
    rentalIncome: 0,
    homeLoanInterestSelf: 0,
    homeLoanInterestLetOut: 0,
    deduction80C: 0,
    deductionNPS: 0,
    medicalInsurance: 0,
    donation80G: 0,
    educationLoanInterest: 0,
    savingsInterest: 0,
    basicSalary: 0,
    da: 0,
    hra: 0,
    rentPaid: 0,
    isMetro: false,
  });

  const [results, setResults] = useState(null);

  const calculateTax = () => {
    const {
      grossSalary,
      otherIncome,
      interestIncome,
      rentalIncome,
      homeLoanInterestSelf,
      homeLoanInterestLetOut,
      deduction80C,
      deductionNPS,
      medicalInsurance,
      donation80G,
      educationLoanInterest,
      savingsInterest,
      ageCategory,
    } = inputs;

    // STEP 1: Total Income
    let totalIncome =
      Number(grossSalary) +
      Number(otherIncome) +
      Number(interestIncome) +
      Number(rentalIncome);

    // STEP 2: Apply Home Loan Interest Deductions
    const homeLoanDeduction =
      Math.min(Number(homeLoanInterestSelf), 200000) +
      Number(homeLoanInterestLetOut);

    totalIncome -= homeLoanDeduction;

    // STEP 3: Apply Deductions
    const totalDeductions =
      Math.min(Number(deduction80C), 150000) +
      Math.min(Number(deductionNPS), 50000) +
      Number(medicalInsurance) +
      Number(donation80G) +
      Number(educationLoanInterest) +
      Math.min(Number(savingsInterest), 10000);

    let taxableIncome = totalIncome - totalDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    // STEP 4: Calculate Tax based on Old Regime (for simplicity)
    let tax = 0;
    if (ageCategory === "Below 60") {
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
      else if (taxableIncome <= 1000000)
        tax = 12500 + (taxableIncome - 500000) * 0.2;
      else tax = 112500 + (taxableIncome - 1000000) * 0.3;
    } else if (ageCategory === "60-80") {
      if (taxableIncome <= 300000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 300000) * 0.05;
      else if (taxableIncome <= 1000000)
        tax = 10000 + (taxableIncome - 500000) * 0.2;
      else tax = 110000 + (taxableIncome - 1000000) * 0.3;
    } else {
      // Super senior >80
      if (taxableIncome <= 500000) tax = 0;
      else if (taxableIncome <= 1000000)
        tax = (taxableIncome - 500000) * 0.2;
      else tax = 100000 + (taxableIncome - 1000000) * 0.3;
    }

    // STEP 5: Add Cess 4%
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    setResults({
      totalIncome: Math.round(totalIncome),
      totalDeductions: Math.round(totalDeductions),
      taxableIncome: Math.round(taxableIncome),
      taxBeforeCess: Math.round(tax),
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      taxAfterRebate:
        taxableIncome <= 500000 ? 0 : Math.round(totalTax), // Rebate u/s 87A
    });
  };

  return (
    <div className="calculator-container">
      <h2>💰 Income Tax Calculator (India)</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Compute your estimated tax liability for FY 2024-25
      </p>

      {/* Input Form */}
      <div className="input-section">
        {/* Age & Year */}
        <div className="input-group">
          <label>Assessment Year</label>
          <select
            value={inputs.assessmentYear}
            onChange={(e) =>
              setInputs({ ...inputs, assessmentYear: e.target.value })
            }
          >
            <option>2025-26</option>
            <option>2024-25</option>
          </select>
        </div>

        <div className="input-group">
          <label>Age Category</label>
          <select
            value={inputs.ageCategory}
            onChange={(e) =>
              setInputs({ ...inputs, ageCategory: e.target.value })
            }
          >
            <option>Below 60</option>
            <option>60-80</option>
            <option>Above 80</option>
          </select>
        </div>

        {/* Incomes */}
        {[
          "grossSalary",
          "otherIncome",
          "interestIncome",
          "rentalIncome",
          "homeLoanInterestSelf",
          "homeLoanInterestLetOut",
          "deduction80C",
          "deductionNPS",
          "medicalInsurance",
          "donation80G",
          "educationLoanInterest",
          "savingsInterest",
          "basicSalary",
          "da",
          "hra",
          "rentPaid",
        ].map((key) => (
          <div className="input-group" key={key}>
            <label>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}{" "}
              (₹)
            </label>
            <input
              type="number"
              value={inputs[key]}
              onChange={(e) =>
                setInputs({ ...inputs, [key]: Number(e.target.value) })
              }
              placeholder="0"
            />
          </div>
        ))}

        <div className="input-group">
          <label>
            <input
              type="checkbox"
              checked={inputs.isMetro}
              onChange={(e) =>
                setInputs({ ...inputs, isMetro: e.target.checked })
              }
            />{" "}
            Do you live in a metro city?
          </label>
        </div>

        <button onClick={calculateTax} className="calculate-btn">
          CALCULATE
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="results-grid">
            <div className="result-card" style={{ background: "#667eea" }}>
              <h4>Total Income</h4>
              <p className="result-value">
                ₹{results.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="result-card" style={{ background: "#4facfe" }}>
              <h4>Total Deductions</h4>
              <p className="result-value">
                ₹{results.totalDeductions.toLocaleString()}
              </p>
            </div>
            <div className="result-card" style={{ background: "#43e97b" }}>
              <h4>Taxable Income</h4>
              <p className="result-value">
                ₹{results.taxableIncome.toLocaleString()}
              </p>
            </div>
            <div className="result-card" style={{ background: "#f093fb" }}>
              <h4>Tax Before Cess</h4>
              <p className="result-value">
                ₹{results.taxBeforeCess.toLocaleString()}
              </p>
            </div>
            <div className="result-card" style={{ background: "#f59e0b" }}>
              <h4>Cess (4%)</h4>
              <p className="result-value">₹{results.cess.toLocaleString()}</p>
            </div>
            <div className="result-card" style={{ background: "#764ba2" }}>
              <h4>Total Tax Payable</h4>
              <p className="result-value">
                ₹{results.taxAfterRebate.toLocaleString()}
              </p>
              {results.taxAfterRebate === 0 && (
                <small>Includes rebate u/s 87A</small>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .input-group {
          margin-bottom: 15px;
        }
        .input-group label {
          display: block;
          margin-bottom: 6px;
          color: #333;
          font-weight: 600;
        }
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .calculate-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
        }
        .calculate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .result-card {
          padding: 25px;
          border-radius: 15px;
          color: white;
          text-align: center;
        }
        .result-value {
          font-size: 28px;
          font-weight: bold;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
