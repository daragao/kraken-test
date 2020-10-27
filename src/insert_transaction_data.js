const createTransactionTable = (db, tableName, columns, indexColumns) =>
  new Promise((resolve, fail) => {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}("${columns.join(
      '", "'
    )}")`;
    const createIndex = `CREATE UNIQUE INDEX IF NOT EXISTS ${indexColumns.join(
      "_"
    )} ON ${tableName} (${indexColumns.join(",")}) ;`;

    db.serialize(() => {
      db.run(createTable, (err) => {
        if (err) fail(err);
      });
      db.run(createIndex, (err) => {
        if (err) fail(err);
      });
      resolve({ tableName, columns });
    });
  });

// This function is unexported and we don't make it a promise, since it is handled by the  db.parallelize() function
// it would probably be advisable to make it a promise also in a larger application
const insertTxs = (db, tableName, columns, txs, callback) => {
  const insertRow = `INSERT OR REPLACE INTO ${tableName} ("${columns.join(
    '", "'
  )}") VALUES `;
  const valuesQuestion = txs
    .map(() => `(${columns.map(() => "?").join(",")})`)
    .join(",\n");
  const values = txs.reduce(
    (prev, t) => prev.concat(columns.map((c) => t[c])),
    []
  );

  const insertValues = insertRow + valuesQuestion;

  db.run(insertValues, values, callback);
};

const insertTxBatch = (db, tableDetails, txs) =>
  new Promise((resolve, fail) => {
    db.serialize(() => {
      db.parallelize(() => {
        // XXX: had to "phase" the  inserts, because it was complaining for using too  many ? in one  go
        for (let i = 0; i < txs.length; i += 50) {
          insertTxs(
            db,
            tableDetails.tableName,
            tableDetails.columns,
            txs.slice(i, i + 50),
            (err) => {
              if (err) fail(err);
            }
          );
        }
      });
      resolve(txs.length);
    });
  });

exports.createTransactionTable = createTransactionTable;
exports.insertTxBatch = insertTxBatch;
exports.insertTxs = insertTxs;
