const mongoose = require('mongoose');
const Counter = require('./Counter');

const schema = mongoose.Schema({
  orderId: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  name: String,
  email: String,
  phone: String,
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    },
    quantity: Number,
    color: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
  }],
  totalPrice: Number,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['paid', 'unpaid', 'refunded'],
  },
  orderStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'in delivery', 'completed', 'cancelled'],
  },
  address: String,
}, {
  timestamps: true,
});

// Pre-save hook to handle auto-incrementing orderId
schema.pre('save', async function (next) {
  if (!this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'orderId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const OrdersModel = mongoose.model('order', schema);

module.exports = OrdersModel;
