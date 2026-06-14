module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ msg: error.details.map((e) => e.message) });
  }
  next();
};
