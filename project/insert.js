const assert = require('assert');
const {log, error, debug} = require('./logger/create_console_logger')(__filename, true);

const insertDocuments = (db, callback) => {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
      {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      log("Inserted 3 documents into the collection");
      callback(result);
    });
  }

  module.exports = insertDocuments;