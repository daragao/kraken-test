const assert = require("assert");
const sqlite3 = require("sqlite3").verbose();
const {
  parseRowToAccountValues,
  queryDepositPerAccount,
} = require("../src/query_transaction_data.js");
const {
  createTransactionTable,
  insertTxs,
} = require("../src/insert_transaction_data.js");

describe("Query Insert Transaction Data", () => {
  it("parse row values", async () => {
    const address = "address1";
    const row = { a: 10, c: 3, address };
    const accountNames = { [address]: "Name1" };
    const accountValues = {
      [address]: { amount: 1, count: 5 },
      address2: { amount: 2, ccount: 2 },
      noRef: { amount: 0, count: 0 },
    };
    const parsedAccountValues = parseRowToAccountValues(
      row,
      accountValues,
      accountNames
    );

    const expectedResult = {
      address1: { amount: 11, count: 8, name: "Name1" },
      address2: { amount: 2, ccount: 2 },
      noRef: { amount: 0, count: 0 },
    };
    assert.deepStrictEqual(
      parsedAccountValues,
      expectedResult,
      "parsed values differ from expected"
    );
  });

  it("query table", async () => {
    const tableName = "test_table";
    const columns = ["address", "id", "c", "amount", "confirmations"];
    const indexColumns = ["id"];
    const txsToBeInserted = [
      { id: 1, address: "addr1", c: 1, amount: 3, confirmations: 3 },
      { id: 2, address: "addr2", c: 2, amount: 4, confirmations: 6 },
      { id: 3, address: "addr2", c: 2, amount: 4, confirmations: 6 },
      { id: 4, address: "addr3", c: 2, amount: 4, confirmations: 6 },
    ];
    const accountNames = { addr1: "Name1", addr2: "Name2" };

    const db = new sqlite3.Database(":memory:");
    try {
      await createTransactionTable(db, tableName, columns, indexColumns);
      await new Promise((resolve, fail) =>
        insertTxs(db, tableName, columns, txsToBeInserted, (err) => {
          if (err) fail(err);
          resolve();
        })
      );
      const accValues = await queryDepositPerAccount(
        db,
        tableName,
        accountNames
      );

      const expectedResult = {
        noRef: { amount: 4, count: 1, name: undefined },
        addr2: { amount: 8, count: 2, name: "Name2" },
      };
      assert.deepStrictEqual(
        accValues,
        expectedResult,
        "parsed values differ from expected"
      );
    } catch (err) {
      assert.fail(err);
    }
    db.close();
  });
});
