const { MongoClient, ObjectID } = require('mongodb');
const assert = require('assert');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const router = require('./router');
const insertDocuments = require('./insert.js');
const { getCollection, insertMany } = require('./mongodb_promisified.js');
const {log, error, debug} = require('./logger/create_console_logger')(__filename, true);

app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
})

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('/upload', router);

app.use(express.static(__dirname + '/public'));

 const getPrimaryKey = (_id) => {
  return ObjectID(_id);
 }

const url = "mongodb://localhost:27017/kursova";

MongoClient.connect(url, { useNewUrlParser: true }, async (err, client) => {
  if (err) throw err;
  log("Database connection created!");

  let dbo = client.db("kursova");

  app.listen(3000, () => {
    log('app listening on port 3000');
  });

  const users = await getCollection(dbo, "1212121");

  app.get('/getUsers', (_, res) => {
    users.find({}).toArray((err, docs) => {
      if (err) {
        error('unable to connect');
      } else {
        console.log(docs);
        res.json(docs);
      }
    });
  });

  

app.put('/:id', (req, res) => {
  const userId = req.params.id;
  const userInput = req.body;

  users.findOneAndUpdate({_id: getPrimaryKey(userId)}, {$set: {
    a : userInput.a,
    date_time: userInput.date_time,
    type: userInput.type
  }}, 
    {returnOriginal : false}, (err, result) => {
      if (err)
        err('not found');
      else {
        res.json(result);
      }
    });
});

app.post('/', (req, res) => {
  const userInput = req.body;
  users.insertOne(userInput, (err, result) => {
    assert(err === null);

    res.json({result: result, document : result.ops[0]});
  });
});

app.delete('/:id', (req, res) => {
  const userId = req.params.id;
  
  users.findOneAndDelete({_id: getPrimaryKey(userId)}, (err, result) => {
    assert(err === null);

    res.json(result);
  }); 
});
});

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});