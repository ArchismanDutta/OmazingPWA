const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user info found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: You do not have access to this resource",
        });
    }

    next();
  };
};

module.exports = roleMiddleware;
