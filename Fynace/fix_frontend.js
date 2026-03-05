const fs = require('fs');
const path = require('path');

const expensesScreenPath = path.join(__dirname, 'src/screens/Expenses/ExpensesScreen.jsx');
let code = fs.readFileSync(expensesScreenPath, 'utf8');

// The fundamental issue is we deleted 'expenses' and 'money_in' from WatermelonDB but components still call them.
// We replace database.get('expenses') with database.get('transactions').query(Q.where('type', 'expense')) and so on.

// Replace database.get('expenses').query(...clauses) to database.get('transactions').query(Q.where('type', 'expense'), ...clauses)
code = code.replace(/database\.get\('expenses'\)\.query\((.*?)\)\.fetch/g, "database.get('transactions').query(Q.where('type', 'expense'), $1).fetch");
code = code.replace(/database\s*\n\s*\.get\('expenses'\)\s*\n\s*\.query\(/g, "database.get('transactions').query(Q.where('type', 'expense'), ");
code = code.replace(/database\.get\('money_in'\)\.query\((.*?)\)\.fetch/g, "database.get('transactions').query(Q.where('type', 'income'), $1).fetch");
code = code.replace(/database\s*\n\s*\.get\('money_in'\)\s*\n\s*\.query\(/g, "database.get('transactions').query(Q.where('type', 'income'), ");

// Fix `item_name` logic
code = code.replace(/Q\.where\('item_name'/g, "Q.where('name'");

// Fix mapping `month` property, since 'transactions' don't have it explicitly as a column in watermelondb schema.
// Well wait! WatermelonDB cannot query Q.where('month', ...) if month does not exist on the schema!!
// We must map selectedMonth (YYYY-MM) to a date boundaries for WatermelonDB, or we do filtering after fetch.
// Actually, it's better to add a helper for month ranges in watermelondb.

fs.writeFileSync(expensesScreenPath + '.backup', code);
console.log("Written script.");
