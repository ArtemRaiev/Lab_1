const assert = require('assert');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const path = require('path');

require('./mongoose/dbconnector');
const userRouter = require('./routers/user');
const orderRouter = require('./routers/order');
const router = require('./router');
const {log, error, debug} = require('./logger/create_console_logger')(__filename, true);

app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('/upload', router);

app.use( '/users', userRouter);
app.use('/orders', orderRouter);

app.use(express.static(__dirname + '/public'));

const users = null;

  app.listen(3000, () => {
    log('app listening on port 3000');
  });

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

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});