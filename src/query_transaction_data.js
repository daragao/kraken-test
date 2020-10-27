// this function avoid mutating the accountValues
// it makes the code slower because we are recreating 2 objects every time
// it makes it safer because the accountValues variable is never mutated
const parseRowToAccountValues = (row, accountValues, accountNames) => {
  const isNoRef = !accountNames[row.address];
  const address = isNoRef ? "noRef" : row.address;
  const accVal = {
    amount: 0,
    count: 0,
    name: accountNames[address],
    ...accountValues[address],
  };
  accVal.amount += row.a;
  accVal.count += row.c;
  return { ...accountValues, [address]: accVal };
};

const queryDepositPerAccount = (db, tableName, accountNames) =>
  new Promise((resolve, fail) => {
    const statement = `SELECT address, COUNT(*) as c, SUM(amount) as a FROM ${tableName} WHERE confirmations >= 6 GROUP BY address;`;

    let accountValues = { noRef: { amount: 0, count: 0 } };
    db.each(
      statement,
      (err, row) => {
        if (err) {
          fail(err);
        } else {
          accountValues = parseRowToAccountValues(
            row,
            accountValues,
            accountNames
          );
        }
      },
      (err) => (err ? fail(err) : resolve(accountValues))
    );
  });

exports.queryDepositPerAccount = queryDepositPerAccount;
exports.parseRowToAccountValues = parseRowToAccountValues;
