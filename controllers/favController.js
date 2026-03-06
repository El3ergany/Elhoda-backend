const Fav = require('../models/Fav');
const Products = require('../models/Products');
const jwt = require('jsonwebtoken');

/**
 * @method GET
 * @description This method gets all favorite items saved by user
 * @access Private
 */
async function getUserFavs(req, res) {
  try {
    // Verify token from cookies
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid or expired token',
      });
    }

    const favDocs = await Fav.find({ userId }).populate('productId');

    // If no favorites, return empty array
    if (!favDocs || favDocs.length === 0)
      return res.status(200).json({
        successful: true,
        msg: 'No favorites found',
        data: [],
      });

    return res.status(200).json({
      successful: true,
      data: favDocs,
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method POST
 * @description This method adds a product to user's favorites
 * @access Private
 */
async function addToFav(req, res) {
  try {
    // Verify token from cookies
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid or expired token',
      });
    }

    const { productId } = req.body;

    if (!productId)
      return res.status(400).json({
        successful: false,
        msg: 'productId is required',
      });

    // Check if product exists
    const product = await Products.findById(productId);
    if (!product)
      return res.status(404).json({
        successful: false,
        msg: 'Product not found',
      });

    // Check if favorite already exists
    const existingFav = await Fav.findOne({ userId, productId });
    if (existingFav)
      return res.status(400).json({
        successful: false,
        msg: 'Product already in favorites',
      });

    // Create new favorite
    const newFav = new Fav({ userId, productId });
    await newFav.save();

    return res.status(201).json({
      successful: true,
      msg: 'Product added to favorites',
      data: newFav,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method DELETE
 * @description This method removes a product from user's favorites
 * @access Private
 */
async function removeFromFav(req, res) {
  try {
    // Verify token from cookies
    const token = req.cookies?.token;
    if (!token)
      return res.status(401).json({
        successful: false,
        msg: 'No token provided',
      });

    let userId;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      userId = payload.id;
    } catch (err) {
      return res.status(401).json({
        successful: false,
        msg: 'Invalid or expired token',
      });
    }

    const { productId } = req.params;

    if (!productId)
      return res.status(400).json({
        successful: false,
        msg: 'productId is required',
      });

    // Find and delete the favorite
    const deletedFav = await Fav.findOneAndDelete({ userId, productId });

    if (!deletedFav)
      return res.status(404).json({
        successful: false,
        msg: 'Favorite not found',
      });

    return res.status(200).json({
      successful: true,
      msg: 'Product removed from favorites',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getUserFavs,
  addToFav,
  removeFromFav,
};

