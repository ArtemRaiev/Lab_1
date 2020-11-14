const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    dateTime: {
        type: String,
        required: true,
        unique: true

    },
    serviceType: {
        type: String,
        required: true,
    },
    imagePath: {
      type: String,
      required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      }
    }, {
      timestamps: true
});

const Order = mongoose.model('Order', orderSchema);


module.exports = Order;
