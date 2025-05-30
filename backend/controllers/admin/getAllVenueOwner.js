const pool = require("../../config/db");

exports.getOwners = async (req, res) => {
  try {
    const role = req.query.role;
    if (role !== "owner") {
      return res.status(400).json({ message: "Faqat ownerlar olinadi" });
    }

    const result = await pool.query(
      "SELECT id, firstname, lastname, username, phone_number FROM users WHERE role = $1",
      [role]
    );

    res.json({ owners: result.rows });
  } catch (error) {
    console.error("Get owners error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
