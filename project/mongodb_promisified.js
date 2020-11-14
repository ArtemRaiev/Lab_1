const handlePromiseResult = (resolve, reject, err, result) => {
  if (err) {
    reject(err);
  }
  resolve(result);
};

const getCollection = (db, collectionName) => (new Promise((resolve, reject) => {
  db.collection(collectionName, handlePromiseResult.bind(null, resolve, reject));
}));

const insertOne = (collection, obj) => (new Promise((resolve, reject) => {
  collection.insertOne(obj, handlePromiseResult.bind(null, resolve, reject));
}));

const insertMany = (collection, objs) => (new Promise((resolve, reject) => {
  collection.insertMany(objs, handlePromiseResult.bind(null, resolve, reject));
}));

const findOne = (collection, query) => (new Promise((resolve, reject) => {
  collection.findOne(query, handlePromiseResult.bind(null, resolve, reject));
}));

const find = (collection, query) => (new Promise((resolve, reject) => {
  collection.find(query, handlePromiseResult.bind(null, resolve, reject));
}));

module.exports = {
  getCollection,
  insertOne,
  insertMany
};
