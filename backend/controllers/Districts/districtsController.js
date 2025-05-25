const pool = require("../../config/db");

exports.districtsController = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM districts ORDER BY name");
    res.json({ districts: result.rows });
  } catch (error) {
    console.error("GET districts error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
