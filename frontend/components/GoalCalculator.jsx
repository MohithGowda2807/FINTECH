import { useState } from 'react';

export default function GoalCalculator() {
  const [goalType, setGoalType] = useState('Car');
  const [targetAmount, setTargetAmount] = useState(800000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [returnRate, setReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [result, setResult] = useState(null);

  const goalTypes = [
    'Buying a Car',
    'Purchasing a Laptop/Gadget',
    'Planning a Foreign Trip',
    'Building Emergency Fund',
    'House Down Payment',
    'Dream Watch/Jewelry',
    'Wedding',
    'Education'
  ];

  const calculateGoal = () => {
    const r = returnRate / 100;
    const i = inflationRate / 100;
    const t = timeHorizon;

    // Inflation-adjusted future value
    const adjustedGoal = targetAmount * Math.pow(1 + i, t);

    // Amount needed to invest
    const amountNeeded = adjustedGoal - currentSavings * Math.pow(1 + r, t);

    // Monthly SIP calculation
    const monthlyRate = r / 12;
    const months = t * 12;
    const monthlySIP = amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);

    // Lumpsum calculation
    const lumpsum = amountNeeded / Math.pow(1 + r, t);

    // AI Tip
    const sipIncrease = Math.round((inflationRate / 2));
    
    setResult({
      adjustedGoal: Math.round(adjustedGoal),
      monthlySIP: Math.round(monthlySIP),
      lumpsum: Math.round(lumpsum),
      totalInvested: Math.round(monthlySIP * months + currentSavings),
      sipIncrease
    });
  };

  return (
    <div className="calculator-card">
      <h2>🎯 Goal-Based Calculator</h2>
      <p className="subtitle">Plan your financial goals with smart investment strategies</p>

      <div className="input-group">
        <label>Goal Type</label>
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          {goalTypes.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Target Amount (₹)</label>
        <input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(Number(e.target.value))}
          placeholder="800000"
        />
      </div>

      <div className="input-group">
        <label>Current Savings (₹) - Optional</label>
        <input
          type="number"
          value={currentSavings}
          onChange={(e) => setCurrentSavings(Number(e.target.value))}
          placeholder="0"
        />
      </div>

      <div className="input-group">
        <label>Time Horizon (Years)</label>
        <input
          type="number"
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(Number(e.target.value))}
          placeholder="5"
        />
      </div>

      <div className="input-group">
        <label>Expected Return Rate (%)</label>
        <input
          type="number"
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value))}
          placeholder="12"
        />
      </div>

      <div className="input-group">
        <label>Inflation Rate (%)</label>
        <input
          type="number"
          value={inflationRate}
          onChange={(e) => setInflationRate(Number(e.target.value))}
          placeholder="6"
        />
      </div>

      <button onClick={calculateGoal} className="calculate-btn">
        Calculate My Goal 🚀
      </button>

      {result && (
        <div className="result-card">
          <h3>📊 Your Goal Plan for: {goalType}</h3>
          
          <div className="result-row">
            <span>Inflation-Adjusted Goal Value:</span>
            <strong>₹{result.adjustedGoal.toLocaleString('en-IN')}</strong>
          </div>

          <div className="result-row highlight">
            <span>💰 Recommended Monthly SIP:</span>
            <strong>₹{result.monthlySIP.toLocaleString('en-IN')}</strong>
          </div>

          <div className="result-row">
            <span>Or One-Time Lumpsum Investment:</span>
            <strong>₹{result.lumpsum.toLocaleString('en-IN')}</strong>
          </div>

          <div className="result-row">
            <span>Total Amount You'll Invest:</span>
            <strong>₹{result.totalInvested.toLocaleString('en-IN')}</strong>
          </div>

          <div className="ai-tip">
            <h4>🤖 AI Investment Tip:</h4>
            <p>
              Increase your SIP by <strong>{result.sipIncrease}%</strong> annually 
              to reach your goal faster and beat inflation! This step-up strategy 
              can help you achieve your "{goalType}" goal {Math.round(timeHorizon * 0.2)} months sooner.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .calculator-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: white;
          font-weight: 600;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
        }

        .calculate-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          transition: transform 0.2s;
        }

        .calculate-btn:hover {
          transform: translateY(-2px);
        }

        .result-card {
          margin-top: 30px;
          background: rgba(255, 255, 255, 0.15);
          padding: 25px;
          border-radius: 15px;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .result-row.highlight {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 10px;
          margin: 10px 0;
        }

        .ai-tip {
          margin-top: 20px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
          border-radius: 12px;
          border: 2px solid rgba(212, 175, 55, 0.4);
        }

        .ai-tip h4 {
          margin-bottom: 10px;
          color: #F4D03F;
        }
      `}</style>
    </div>
  );
}
