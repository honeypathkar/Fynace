const fs = require('fs');
const path = require('path');

const files = [
  '../src/screens/Expenses/ExpensesScreen.jsx',
  '../src/screens/Home/HomeScreen.jsx',
  '../src/screens/Expenses/AddExpenseScreen.jsx',
  '../src/screens/MoneyIn/MoneyInScreen.jsx',
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log('Not found:', fullPath);
    return;
  }

  let code = fs.readFileSync(fullPath, 'utf8');

  code = code.replace(
    /database\.get\('expenses'\)\.query\(/g,
    "database.get('transactions').query(Q.where('type', 'expense'), ",
  );
  code = code.replace(
    /database\.get\('money_in'\)\.query\(/g,
    "database.get('transactions').query(Q.where('type', 'income'), ",
  );

  code = code.replace(
    /database\.get\('expenses'\)\.find\(/g,
    "database.get('transactions').find(",
  );
  code = code.replace(
    /database\.get\('expenses'\)\.create\(/g,
    "database.get('transactions').create(",
  );
  code = code.replace(
    /database\.get\('money_in'\)\.create\(/g,
    "database.get('transactions').create(",
  );

  code = code.replace(/Q\.where\('item_name'/g, "Q.where('name'");

  fs.writeFileSync(fullPath, code);
  console.log('Fixed', file);
});
