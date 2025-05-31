const pool = require("../../config/db");


exports.cancelBron = async (req, res) => {
    try {
      const user = req.user;
      const bookingId = req.params.id;
  
      // Bron mavjudligini tekshirish
      const bookingResult = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ message: "Bron topilmadi" });
      }
      const booking = bookingResult.rows[0];
  
      // Foydalanuvchi faqat o‘z bronini bekor qilishi mumkin, admin hamma bronni bekor qilishi mumkin
      if (user.role !== "admin" && booking.user_id !== user.id) {
        return res.status(403).json({ message: "Siz ushbu bronni bekor qila olmaysiz" });
      }
  
      // Bron statusini bekor qilingan qilib o‘zgartirish
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
  