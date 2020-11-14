/* eslint-disable no-use-before-define */
const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Order = require('./order');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.pre('save', async function hashPassword(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre('remove', async function removeAssociatedOrders(next) {
  const user = this;
  await Order.deleteMany({ owner: user._id });
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'crankerkor');

  user.tokens = [...user.tokens, { token }];
  await user.save();

  return token;
};

const hiddenProperties = ['isAdmin', 'password', 'tokens'];
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  hiddenProperties.forEach(property => delete userObj[property]);
  return userObj;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

const User = mongoose.model('User', userSchema);


module.exports = User;
