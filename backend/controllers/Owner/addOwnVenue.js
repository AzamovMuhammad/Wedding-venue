// controllers/Owner/addOwnVenue.js
const pool = require("../../config/db");

exports.addOwnVenue = async (req, res) => {
  try {
    const loggedInUser = req.user; // authentication middleware'dan
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      // Admin yuborishi mumkin bo'lgan qo'shimcha maydonlar:
      status,    // Agar admin bu endpointni ishlatsa
      owner_id: adminOwnerId, // Agar admin bu endpointni ishlatsa
    } = req.body; // <<=== FAYLLAR BU YERDA KUTILMAYDI, FAQAT JSON BODY

    console.log("addOwnVenue (details only) - req.body:", req.body);
    console.log("addOwnVenue (details only) - loggedInUser:", loggedInUser);

    if (!name || !district_id || !address || !capacity || !price_per_seat) {
      return res
        .status(400)
        .json({ message: "Kerakli maydonlar to‘ldirilmagan" });
    }

    let finalOwnerId;
    let finalVenueStatus;

    // Rolga qarab owner_id va statusni belgilash
    if (loggedInUser.role === "admin") {
      finalOwnerId = adminOwnerId || loggedInUser.id; // Admin o'zi uchun ham qo'shishi yoki boshqa owner tanlashi mumkin
      finalVenueStatus = status || "tasdiqlangan"; // Admin qo'shsa, statusni ham belgilashi mumkin
    } else if (loggedInUser.role === "owner") {
      finalOwnerId = loggedInUser.id;
      finalVenueStatus = "tasdiqlanmagan"; // Owner qo'shgan venue odatda tasdiqlashni kutadi
    } else {
      return res
        .status(403)
        .json({ message: "Faqat admin yoki owner venue qo‘shishi mumkin" });
    }

    const query = `
      INSERT INTO venues
        (name, district_id, address, capacity, price_per_seat, status, owner_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`; // Yoki faqat kerakli maydonlarni, masalan: id, name, status

    const values = [
      name,
      parseInt(district_id), // Stringni integerga o'tkazish
      address,
      parseInt(capacity),    // Stringni integerga o'tkazish
      parseFloat(price_per_seat), // Stringni floatga o'tkazish
      finalVenueStatus,
      finalOwnerId,
    ];

    const result = await pool.query(query, values);
    const newVenue = result.rows[0];

    if (!newVenue) {
        console.error("addOwnVenue: To'yxona yaratilmadi (DB dan javob yo'q).");
        return res.status(500).json({ message: "To'yxonani yaratishda serverda xatolik."});
    }

    res.status(201).json({
      venue: newVenue,
      message: "To’yxona ma'lumotlari muvaffaqiyatli saqlandi. Endi rasmlarni yuklashingiz mumkin."
    });

  } catch (error) {
    console.error("ADD OWN VENUE (details only) error:", error);
    if (error.code === '23503') { // Foreign key violation
      if (error.constraint && error.constraint.includes("district_id")) {
        return res.status(400).json({ message: "Ko'rsatilgan tuman (district_id) mavjud emas." });
      } else if (error.constraint && error.constraint.includes("owner_id")) {
        return res.status(400).json({ message: "Ko'rsatilgan egasi (owner_id) mavjud emas." });
      }
      return res.status(400).json({ message: "Noto'g'ri ma'lumot kiritildi (ID mavjud emas)." });
    }
    res.status(500).json({ message: "Server xatosi: " + error.message });
  }
};