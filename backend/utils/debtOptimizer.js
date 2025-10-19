// Sort debts by highest interest (Avalanche)
function avalancheOrder(debts) {
  return debts.slice().sort((a, b) => b.interest_rate - a.interest_rate);
}

// Sort debts by smallest principal (Snowball)
function snowballOrder(debts) {
  return debts.slice().sort((a, b) => a.principal - b.principal);
}

// Calculate EMI
function calcEMI(principal, interestRate, tenureMonths) {
  const r = interestRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

module.exports = { avalancheOrder, snowballOrder, calcEMI };
