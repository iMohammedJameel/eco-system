const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");

module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(appError.create("ليست لديك صلاحية للوصول لهذا المورد", 403, ERROR));
  }
  next();
};
