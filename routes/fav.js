const express = require('express');
const router = express.Router();

const { authorizingUser } = require('../middleware/verifyUser.js');
const {
  getUserFavs,
  addToFav,
  removeFromFav,
} = require('../controllers/favController');

// Get user's favorites
router.get('/user', authorizingUser, getUserFavs);

// Add product to favorites
router.post('/add', authorizingUser, addToFav);

// Remove product from favorites
router.delete('/remove/:productId', authorizingUser, removeFromFav);

module.exports = router;
