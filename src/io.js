const fs = require("fs");

const loadTransactions = (filename) => {
  const rawdata = fs.readFileSync(filename);
  const transactions = JSON.parse(rawdata);
  return transactions;
};

// print out the accounts and its values
// XXX: the accounts addresses could be  gotten form the accValues variable
// making this function only have  one argument, but the order of the
// names would not be exactly the same as the one in the example
const parseQueryDepositPerAccount = (accValues, accountNames) => {
  const accounts = Object.keys(accountNames);
  const validDepositAmounts = Object.values(accValues).map((a) => a.amount);

  let resultStr = accounts.reduce(
    (prev, acc) =>
      `${prev}Deposited for ${accValues[acc].name}: ` +
      `count=${accValues[acc].count} sum=${accValues[acc].amount}\n`,
    ""
  );

  resultStr += `Deposit without reference: count=${accValues.noRef.count} sum=${accValues.noRef.amount}\n`;
  resultStr += `Smallest valid deposit: ${Math.min(...validDepositAmounts)}\n`;
  resultStr += `Largest valid deposit: ${Math.max(...validDepositAmounts)}\n`;
  return resultStr;
};

exports.loadTransactions = loadTransactions;
exports.parseQueryDepositPerAccount = parseQueryDepositPerAccount;
