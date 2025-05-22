exports.checkRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Foydalanuvchi aniqlanmadi" });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Sizda bu amalni bajarishga ruxsat yo‘q" });
      }
  
      next();
    };
  };
  