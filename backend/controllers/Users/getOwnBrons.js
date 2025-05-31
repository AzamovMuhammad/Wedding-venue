
const pool = require("../../config/db");

exports.getBron = async (req, res) => {
    try {
      const user = req.user;
      let result;
  
      if (user.role === "admin") {
        result = await pool.query(
          `SELECT b.*, v.name as venue_name, u.firstname, u.lastname
           FROM bookings b
           JOIN venues v ON b.venue_id = v.id
           JOIN users u ON b.user_id = u.id
           ORDER BY b.reservation_date DESC`
        );
      } else {
        result = await pool.query(
          `SELECT b.*, v.name as venue_name
           FROM bookings b
           JOIN venues v ON b.venue_id = v.id
           WHERE b.user_id = $1
           ORDER BY b.reservation_date DESC`,
          [user.id]
        );
      }
  
      res.json({ bookings: result.rows });
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Server xatosi" });
    }
  };
  