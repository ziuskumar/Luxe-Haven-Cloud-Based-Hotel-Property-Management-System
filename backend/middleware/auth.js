const { verifyToken } = require("../utils/jwt.js");
const User = require("../Models/user.js");

/**
 * Protect routes: verify JWT Bearer token
 */
async function protect(req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in. Please log in to gain access.",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists or is deactivated.",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: err.message,
    });
  }
}

/**
 * Restrict to specific roles (RBAC)
 * e.g. restrictTo('admin', 'hotel_manager')
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Your role '${req.user?.role || "guest"}' does not have permission to perform this action. Required: [${roles.join(", ")}]`,
      });
    }
    next();
  };
}

module.exports = {
  protect,
  restrictTo,
};
