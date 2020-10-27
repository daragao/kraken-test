const sqlite3 = require("sqlite3").verbose();
const {
  createTransactionTable,
  insertTxs,
  insertTxBatch,
} = require("../src/insert_transaction_data.js");

// XXX: could not use beforeEach and afterEach to create and close the db due to synch issues
describe("Insert Transaction Data and Create Table", () => {
  const tableName = "test_table";
  const columns = ["a", "b", "c"];
  const indexColumns = ["a"];

  /*
  let db;
  beforeEach(() => {
    return new Promise((resolve, fail) => {
      db = new sqlite3.Database(":memory:", (err) =>
        err ? fail(err) : resolve()
      );
    });
  });
  afterEach(() => {
    return new Promise((resolve, fail) =>
      db.close((err) => (err ? fail(err) : resolve(err)))
    );
  });
  */

  describe("Create Table and Index", () => {
    it("check if table was created", async () => {
      const db = new sqlite3.Database(":memory:");
      await createTransactionTable(db, tableName, columns, indexColumns);
      const tableExistsQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`;
      return new Promise((resolve, fail) =>
        db.get(tableExistsQuery, [tableName], (err, row) => {
          if (err) fail(err);
          if (!row) fail(new Error("table not created"));
          db.close();
          resolve();
        })
      );
    });

    /*
    it("check if index was created", async () => {
      await createTransactionTable(db, tableName, columns, indexColumns);
      const indexExistsQuery = `SELECT * FROM sqlite_master WHERE type='index' AND tbl_name=?;`;
      return new Promise((resolve, fail) =>
        db.get(indexExistsQuery, [tableName], (err, row) => {
          if (err) fail(err);
          if (!row) fail(new Error("index not created"));
          resolve();
        })
      );
    });
    */
  });

  describe("Insert rows", () => {
    const txsToBeInserted = [
      { a: "a", b: "b", c: "c" },
      { a: "ab", b: "b", c: "c" },
    ];

    it("check if single insert works", async () => {
      const db = new sqlite3.Database(":memory:");
      await createTransactionTable(db, tableName, columns, indexColumns);

      await new Promise((resolve, fail) =>
        insertTxs(db, tableName, columns, txsToBeInserted, (err) => {
          if (err) fail(err);
          resolve();
        })
      );

      const queryTable = `SELECT * FROM ${tableName};`;
      return new Promise((resolve, fail) =>
        db.all(queryTable, (err, rows) => {
          if (err) fail(err);
          if (!rows) fail(new Error("rows not inserted"));
          if (rows.length !== 2) fail(new Error("wrong amount of row"));
          db.close();
          resolve();
        })
      );
    });

    it("check if batch insert works", async () => {
      const db = new sqlite3.Database(":memory:");
      const tableDetails = await createTransactionTable(
        db,
        tableName,
        columns,
        indexColumns
      );
      await insertTxBatch(db, tableDetails, txsToBeInserted);

      const queryTable = `SELECT * FROM ${tableName};`;
      await new Promise((resolve, fail) =>
        db.all(queryTable, (err, rows) => {
          if (err) fail(err);
          if (!rows) fail(new Error("rows not inserted"));
          if (rows.length !== 2) fail(new Error("wrong amount of row"));
          db.close();
          resolve();
        })
      );
    });
  });
});
