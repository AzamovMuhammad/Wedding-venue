const pool = require("../../config/db");

// CREATE
exports.createVenue = async (req, res) => {
  try {
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      phone_number,
      status, // owner uchun default "tasdiqlanmagan" bo‘lishi kerak, admin kiritsa "tasdiqlangan"
    } = req.body;

    if (!name || !district_id || !address || !capacity || !price_per_seat) {
      return res.status(400).json({ message: "Kerakli maydonlar to‘ldirilmagan" });
    }

    let venueStatus = status;
    // Agar owner bo‘lsa, statusni majburan "tasdiqlanmagan" qilamiz
    if (req.user.role === "owner") {
      venueStatus = "tasdiqlanmagan";
    } else if (!venueStatus) {
      venueStatus = "pending"; // admin uchun default holat
    }

    const result = await pool.query(
      `INSERT INTO venues 
      (name, district_id, address, capacity, price_per_seat, phone_number, status, owner_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, district_id, address, capacity, price_per_seat, phone_number || null, venueStatus, req.user.id]
    );

    res.status(201).json({ venue: result.rows[0] });
  } catch (error) {
    console.error("CREATE venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// READ ALL
exports.getAllVenues = async (req, res) => {
  try {
    const { role } = req.user;

    let query = `SELECT v.*, d.name as district_name, u.firstname as owner_firstname, u.lastname as owner_lastname
                 FROM venues v
                 JOIN districts d ON v.district_id = d.id
                 JOIN users u ON v.owner_id = u.id`;

    if (role === "user") {
      // Oddiy foydalanuvchilar faqat tasdiqlangan to’yxonalarni ko‘radi
      query += ` WHERE v.status = 'tasdiqlangan'`;
    }

    const result = await pool.query(query);

    res.json({ venues: result.rows });
  } catch (error) {
    console.error("GET all venues error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// READ ONE
exports.getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venueResult = await pool.query(
      `SELECT v.*, d.name as district_name, u.firstname as owner_firstname, u.lastname as owner_lastname
       FROM venues v
       JOIN districts d ON v.district_id = d.id
       JOIN users u ON v.owner_id = u.id
       WHERE v.id = $1`,
      [id]
    );

    if (venueResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    const venue = venueResult.rows[0];

    // Bu yerga bron (booking) kalendarini qo‘shish mumkin (keyinchalik)

    res.json({ venue });
  } catch (error) {
    console.error("GET venue by id error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// UPDATE
exports.updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      phone_number,
      status,
    } = req.body;

    // Faqat admin statusni o‘zgartira oladi
    if (status && req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin statusni o‘zgartira oladi" });
    }

    // To'yxonani tekshirish (borligini)
    const venueCheck = await pool.query("SELECT * FROM venues WHERE id = $1", [id]);
    if (venueCheck.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    // Owner faqat o‘zining to’yxonasini tahrirlashi kerak
    if (req.user.role === "owner" && venueCheck.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "Siz faqat o‘z to’yxonangizni o‘zgartira olasiz" });
    }

    const updatedVenue = await pool.query(
      `UPDATE venues SET
       name = COALESCE($1, name),
       district_id = COALESCE($2, district_id),
       address = COALESCE($3, address),
       capacity = COALESCE($4, capacity),
       price_per_seat = COALESCE($5, price_per_seat),
       phone_number = COALESCE($6, phone_number),
       status = COALESCE($7, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, district_id, address, capacity, price_per_seat, phone_number, status, id]
    );

    res.json({ venue: updatedVenue.rows[0] });
  } catch (error) {
    console.error("UPDATE venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// DELETE
exports.deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin o‘chirishi mumkin" });
    }

    const delResult = await pool.query("DELETE FROM venues WHERE id = $1 RETURNING *", [id]);

    if (delResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    res.json({ message: "To’yxona muvaffaqiyatli o‘chirildi" });
  } catch (error) {
    console.error("DELETE venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
