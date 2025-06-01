const pool = require("../../config/db");

exports.getAllBookingsDates = async (req, res) => {
  try {
    // Barcha foydalanuvchilar barcha bronlangan sanalarni ko‘rishi mumkin
    const query = `
      SELECT reservation_date
      FROM bookings
      WHERE status != 'bekor qilingan'
      ORDER BY reservation_date
    `;

    const result = await pool.query(query);

    res.json({ bookedDates: result.rows.map(row => row.reservation_date) });
  } catch (error) {
    console.error("Get bookings dates error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
