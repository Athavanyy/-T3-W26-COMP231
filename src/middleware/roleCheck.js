const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const allowed = allowedRoles.map(role => role.toUpperCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = roleCheck;