const pool = require("../../config/db");
exports.getBron = async (req, res) => {
  try {
    const user = req.user;
    let result;

    if (user.role === "admin") {
      result = await pool.query(
        `SELECT b.*, v.name as venue_name, u.firstname, u.lastname, u.phone_number
         FROM bookings b
         JOIN venues v ON b.venue_id = v.id
         JOIN users u ON b.user_id = u.id`
      );
    } else if (user.role === "owner") {
      result = await pool.query(
        `SELECT b.*, v.name as venue_name, u.firstname, u.lastname, u.phone_number
         FROM bookings b
         JOIN venues v ON b.venue_id = v.id
         JOIN users u ON b.user_id = u.id
         WHERE v.owner_id = $1`,
        [user.id]
      );
    } else {
      result = await pool.query(
        `SELECT b.*, v.name as venue_name
         FROM bookings b
         JOIN venues v ON b.venue_id = v.id
         WHERE b.user_id = $1`,
        [user.id]
      );
    }

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
