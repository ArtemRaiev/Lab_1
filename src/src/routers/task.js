const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');


const router = new express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
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

router.get('/', auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  const options = {};
  options.limit = parseInt(req.query.limit, 10);
  options.skip = parseInt(req.query.skip, 10);
  if (req.query.sortBy) {
    options.sort = parseSortQuery(req.query.sortBy);
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options
    }).execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne(
      { _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/:id', auth, async (req, res) => {
  const updates = Reflect.ownKeys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(
    update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation' });
  }

  try {
    const task = await Task.findOne(
      { _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    return res.send(task);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete(
      { _id: req.params.id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    return res.status(500).send();
  }
});


module.exports = router;
