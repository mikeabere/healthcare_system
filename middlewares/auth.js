const jwt = require("jsonwebtoken");
const {
  UnauthenticatedError,
  UnauthorizedError,
} = require("../errors/customError.js");

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) throw new UnauthenticatedError("Not authorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based access control (e.g., only doctors can create slots)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("You do not have permission");
    }
    next();
  };
};
