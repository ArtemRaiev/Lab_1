const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');


const router = new express.Router();

router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

const allowedUpdates = ['name', 'age', 'email'];
router.patch('/me', auth, async (req, res) => {
  const updates = Reflect.ownKeys(req.body);
  const isValidOperation = updates.every(
    update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    if (!req.user) {
      return res.status(404).send();
    }
    res.send(req.user);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    return res.status(500).send();
  }
});


module.exports = router;
