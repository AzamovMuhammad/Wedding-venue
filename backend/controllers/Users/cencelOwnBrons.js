const pool = require("../../config/db");


exports.cancelBron = async (req, res) => {
  try {
    const user = req.user; 
    const bookingId = req.params.id;

    const bookingResult = await pool.query(
      `SELECT b.*, v.owner_id
       FROM bookings b
       JOIN venues v ON b.venue_id = v.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Bron topilmadi" });
    }

    const booking = bookingResult.rows[0];

    if (
      user.role !== "admin" &&
      booking.user_id !== user.id &&
      !(user.role === "owner" && booking.owner_id === user.id)
    ) {
      return res.status(403).json({ message: "Siz ushbu bronni bekor qila olmaysiz" });
    }

    const cancelResult = await pool.query(
      "UPDATE bookings SET status = 'bekor qilingan' WHERE id = $1 RETURNING *",
      [bookingId]
    );

    res.json({ booking: cancelResult.rows[0] });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
