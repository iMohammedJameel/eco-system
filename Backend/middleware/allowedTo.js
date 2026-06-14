const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");

module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(appError.create("Access denied", 403, ERROR));
  }
  next();
};
