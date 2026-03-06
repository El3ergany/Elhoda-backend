const Joi = require('joi');

function productValidation(req, res, next) {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      desc: Joi.string().required(),
      category: Joi.string().required(),
      price: Joi.number().required(),
      salePrice: Joi.number().optional(),
      sizes: Joi.string().required(), // JSON string from frontend
      colors: Joi.string().optional(), // JSON string from frontend
      isFeatured: Joi.any().optional(),
      stock: Joi.any().optional().default(true),
    });
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({
        successful: false,
        msg: error.details[0].message,
      });

    if (!req.files || req.files.length === 0) {
      if (req.method === 'POST') {
        return res.status(400).json({
          successful: false,
          msg: 'At least one product image is required',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

module.exports = productValidation;
