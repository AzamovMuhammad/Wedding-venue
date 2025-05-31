// bookingController.js

const pool = require("../../config/db");

exports.addOwnBrons = async (req, res) => {
  try {
    const user = req.user;  // JWT orqali aniqlangan foydalanuvchi
    const { venue_id, reservation_date, guest_count } = req.body;

    if (!venue_id || !reservation_date || !guest_count) {
      return res.status(400).json({ message: "Kerakli maydonlar to‘ldirilmagan" });
    }

    // To’yxona mavjudligini tekshirish
    const venueCheck = await pool.query("SELECT * FROM venues WHERE id = $1", [venue_id]);
    if (venueCheck.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    // Bron sanasi tekshiruvi va boshqa biznes qoidalar qo‘yilishi mumkin

    const result = await pool.query(
      `INSERT INTO bookings (venue_id, user_id, reservation_date, guest_count, status)
       VALUES ($1, $2, $3, $4, 'endi bo‘ladigan') RETURNING *`,
      [venue_id, user.id, reservation_date, guest_count]
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
