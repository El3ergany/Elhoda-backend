const Cart = require('../models/Cart');
const Products = require('../models/Products');

/**
 * @method GET
 * @description Get all items in the user's cart
 * @access Private
 */
async function getUserCart(req, res) {
  try {
    const userId = req.userId;

    const cartDoc = await Cart.findOne({ userId });

    if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0)
      return res.status(200).json({
        successful: true,
        data: [],
      });

    const enrichedItems = [];
    for (const item of cartDoc.items) {
      const product = await Products.findById(item.productId);
      if (product) {
        enrichedItems.push({
          _id: item._id,
          productId: item.productId,
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images && product.images[0] ? product.images[0] : '',
          quantity: parseInt(item.quantity) || 1,
          color: item.color || null,
          size: item.size || null,
        });
      }
    }

    return res.status(200).json({
      successful: true,
      data: enrichedItems,
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
 * @description Add a new item to the user's cart
 * @access Private
 */
async function addItemToCart(req, res) {
  try {
    const userId = req.userId;
    const { productId, quantity, color, size } = req.body;

    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }

    // Check if duplicate item exists (same product, color, and size)
    const existingItemIndex = userCart.items.findIndex(
      item => item.productId === productId &&
        item.color === color &&
        item.size === size
    );

    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].quantity =
        parseInt(userCart.items[existingItemIndex].quantity) + parseInt(quantity);
    } else {
      userCart.items.push({
        productId,
        quantity: parseInt(quantity),
        color: color || null,
        size: size || null,
      });
    }

    await userCart.save();

    return res.status(201).json({
      successful: true,
      msg: 'Item added to cart',
      data: userCart.items,
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
 * @description Remove an item from the cart
 * @access Private
 */
async function removeItemFromCart(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    return res.status(200).json({
      successful: true,
      msg: 'Item removed from cart',
      data: updatedCart.items,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method PATCH
 * @description Update cart item quantity
 * @access Private
 */
async function updateCartItemQuantity(req, res) {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ successful: false, msg: 'Quantity must be at least 1' });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity.toString() } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ successful: false, msg: 'Item not found in cart' });
    }

    return res.status(200).json({
      successful: true,
      msg: 'Quantity updated',
      data: updatedCart.items,
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
 * @description Clear the user's cart
 * @access Private
 */
async function clearCart(req, res) {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      successful: true,
      msg: 'Cart cleared successfully',
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
};
