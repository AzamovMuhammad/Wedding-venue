const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authentication = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token berilmadi" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT authentication error:", error.message);
    res.status(401).json({ message: "Token noto‘g‘ri yoki muddati o‘tgan" });
  }
};
