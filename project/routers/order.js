const express = require('express');
const Order = require('../models/order');
const authorize = require('../middleware/auth');


const orderRouter = new express.Router();

orderRouter.post('/', authorize, async (req, res) => {
  try {
    const order = new Order({ ...req.body, owner: req.user._id });
    await order.save();
    console.log(res);
    res.status(201).send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

const parseSortQuery = sortQuery => {
  const [sortField, order] = sortQuery.split(':');
  const parsedSort = {};

  // eslint-disable-next-line default-case
  switch (order) {
    case 'asc': parsedSort[sortField] = 1; break;
    case 'desc': parsedSort[sortField] = -1; break;
  }

  return parsedSort;
};

orderRouter.get('/:id', authorize, async (req, res) => {
  try {
    const order = await Order.findOne(
      { _id: req.params.id, owner: req.user._id });
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

orderRouter.get('/', authorize, async (req, res) => {
  const options = {};
  options.limit = parseInt(req.query.limit, 10);
  options.skip = parseInt(req.query.skip, 10);
  if (req.query.sortBy) {
    options.sort = parseSortQuery(req.query.sortBy);
  }

  try {
    await req.user.populate({
      path: 'orders',
      options
    }).execPopulate();
    res.send(req.user.orders);
  } catch (e) {
    res.status(500).send(e);
  }
});

orderRouter.patch('/:id', authorize, async (req, res) => {
  const updates = Reflect.ownKeys(req.body);
  const allowedUpdates = ['serviceType', 'dateTime'];
  const isValidOperation = updates.every(
    update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation' });
  }

  try {
    const order = await Order.findOne(
      { _id: req.params.id, owner: req.user._id });
    if (!order) {
      return res.status(404).send();
    }

    updates.forEach(update => order[update] = req.body[update]);
    await order.save();

    res.send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

orderRouter.delete('/:id', authorize, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete(
      { _id: req.params.id, owner: req.user._id });

    if (!order) {
      return res.status(404).send();
    }

    res.send(order);
  } catch (e) {
    return res.status(500).send();
  }
});


module.exports = orderRouter;
