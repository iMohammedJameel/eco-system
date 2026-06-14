const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(appError.create("Token is required", 401, ERROR));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(appError.create("Invalid or expired token", 401, ERROR));
  }
};
