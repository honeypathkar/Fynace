const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/Expenses/ExpensesScreen.jsx',
  'src/screens/Home/HomeScreen.jsx',
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;

  let code = fs.readFileSync(fullPath, 'utf8');

  // Fix multi-line database.get('expenses') calls
  code = code.replace(/database\s*\n\s*\.get\('expenses'\)\s*\n\s*\.query\(/g, "database.get('transactions').query(Q.where('type', 'expense'), ");
  code = code.replace(/database\.get\('expenses'\)\s*\n\s*\.query\(/g, "database.get('transactions').query(Q.where('type', 'expense'), ");

  // Fix amount summing bug (paise vs rupees) by using moneyIn/moneyOut which return rupees, or dividing by 100
  // In `ExpensesScreen.jsx`:
  // acc[exp.category] = (acc[exp.category] || 0) + amt;
  // Let's globally replace (exp.moneyOut || exp.amount || 0) with exp.amountRupees (since I added it to the model)
  code = code.replace(/\(exp\.moneyOut \|\| exp\.amount \|\| 0\)/g, "(exp.amountRupees || 0)");
  code = code.replace(/\(entry\.amount \|\| 0\)/g, "(entry.amountRupees || 0)");
  code = code.replace(/\(exp\.amount \|\| 0\)/g, "(exp.amountRupees || 0)");

  fs.writeFileSync(fullPath, code);
  console.log('Fixed missed in', file);
});
