const Joi = require('joi');

function validateCategory(req, res, next) {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      status: Joi.string().optional().default('active'),
    });

    const { error } = schema.validate(req.body);

    if (error)
      return res.status(400).json({
        successful: false,
        msg: error.details[0].message,
      });

    if (!req.file) {
      return res.status(400).json({
        successful: false,
        msg: 'Category image is required',
      });
    }

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
  next();
}

module.exports = validateCategory;
