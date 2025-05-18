const jwt = require("jsonwebtoken");

exports.authentication = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token berilmadi." });
    }

    jwt.verify(token, "MEN SENGA BIR GAP AYTAMAN, HECH KIM BILMASIN");
    next();
  } catch (error) {
    res.status(403).json({
      message: error.message,
    });
  }
};
