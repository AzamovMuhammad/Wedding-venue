const pool = require("../../config/db");

exports.getAllBookingsDates = async (req, res) => {
  try {
    const query = `
      SELECT reservation_date
      FROM bookings
      WHERE status != 'bekor qilingan'
    `;

    const result = await pool.query(query);

    res.json({ bookedDates: result.rows.map(row => row.reservation_date) });
  } catch (error) {
    console.error("Get bookings dates error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
