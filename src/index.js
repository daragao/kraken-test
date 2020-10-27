const sqlite3 = require("sqlite3").verbose();
const { parseQueryDepositPerAccount, loadTransactions } = require("./io.js");
const {
  createTransactionTable,
  insertTxBatch,
} = require("./insert_transaction_data.js");
const { queryDepositPerAccount } = require("./query_transaction_data.js");

const main = async (dbFilepath, tableName, txFilepath, accountNames) => {
  const db = new sqlite3.Database(dbFilepath, (err) => {
    if (err) throw err;
  });

  // load txs
  const allTxs = txFilepath.reduce(
    (prev, file) => prev.concat(loadTransactions(file).transactions),
    []
  );
  if (allTxs.length === 0) return;
  // get colums names
  const columns = Object.keys(allTxs[0]);
  const indexColumns = ["txid", "vout"];

  const tableDetails = await createTransactionTable(
    db,
    tableName,
    columns,
    indexColumns
  );

  // FIXME: this might cause an error because the insert of file1 and file2 might not happen in the right order
  await insertTxBatch(db, tableDetails, allTxs);

  // query db
  const accountValues = await queryDepositPerAccount(
    db,
    tableName,
    accountNames
  );
  // print results
  const resultStr = parseQueryDepositPerAccount(accountValues, accountNames);

  process.stdout.write(resultStr);

  db.close((err) => {
    if (err) throw err;
  });
};

// XXX: it is assumed that the transactions-2.json was queried after transactions-1.json
const txFilepath = ["transactions-1.json", "transactions-2.json"];
const dbFilepath = "kraken_transactions.db";
const accountNames = {
  mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ: "Wesley Crusher",
  mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp: "Leonard McCoy",
  mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n: "Jonathan Archer",
  "2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo": "Jadzia Dax",
  mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8: "Montgomery Scott",
  miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM: "James T. Kirk",
  mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV: "Spock",
};
const tableName = "transactions";
main(dbFilepath, tableName, txFilepath, accountNames);
