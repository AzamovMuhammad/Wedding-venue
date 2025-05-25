const pool = require("../../config/db");

exports.uploadVenueImages = async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const userRole = req.user.role;
    const userId = req.user.id;

    // To'yxona borligini va foydalanuvchining huquqini tekshirish
    const venueResult = await pool.query("SELECT * FROM venues WHERE id = $1", [venueId]);
    if (venueResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }
    const venue = venueResult.rows[0];

    // Owner faqat o‘zining to’yxonasi uchun ruxsat olishi mumkin
    if (userRole === "owner" && venue.owner_id !== userId) {
      return res.status(403).json({ message: "Siz faqat o‘z to’yxonangiz uchun surat yuklashingiz mumkin" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Hech qanday fayl yuklanmadi" });
    }

    // Har bir fayl uchun baza yozish
    const insertPromises = req.files.map((file) => {
      // Fayl nomi yoki yo‘lini saqlaymiz
      const imageUrl = `/uploads/venues/${file.filename}`;
      return pool.query(
        "INSERT INTO venue_images (venue_id, image_url) VALUES ($1, $2)",
        [venueId, imageUrl]
      );
    });

    await Promise.all(insertPromises);

    res.json({ message: `${req.files.length} ta surat muvaffaqiyatli yuklandi` });
  } catch (error) {
    console.error("Venue image upload error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
