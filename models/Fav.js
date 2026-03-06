const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
}, {
  timestamps: true,
});

const FavModel = mongoose.model('fav', schema);

module.exports = FavModel;
