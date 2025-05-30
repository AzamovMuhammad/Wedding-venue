const pool = require("../../config/db");

// CREATE VENUE pool ni import qilganingizga ishonch hosil qiling

exports.createVenue = async (req, res) => {
  try {
    const loggedInUser = req.user; // Tizimga kirgan foydalanuvchi (token orqali)
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      status, // Frontenddan kelayotgan status
      owner_id, // <<<<--- Frontenddan kelayotgan owner_id ni o'qish
    } = req.body;

    if (!name || !district_id || !address || !capacity || !price_per_seat) {
      return res
        .status(400)
        .json({ message: "Kerakli maydonlar to‘ldirilmagan" });
    }

    let finalOwnerId;
    let finalVenueStatus;

    if (loggedInUser.role === "admin") {
      // Agar admin venue qo'shsa:
      // Frontenddan yuborilgan owner_id ni ishlatamiz.
      // Agar frontend owner_id yubormasa, null bo'lishi mumkin (yoki xatolik qaytarish kerak).
      // Sizning holatingizda frontend owner_id ni yuboradi.
      finalOwnerId = owner_id || null; // Agar owner_id kelmasa null, aks holda kelgan qiymat
      finalVenueStatus = status || "pending"; // Admin statusni o'rnatishi mumkin, standart "pending"
    } else if (loggedInUser.role === "owner") {
      // Agar owner o'zi uchun venue qo'shsa:
      finalOwnerId = loggedInUser.id;
      finalVenueStatus = "tasdiqlanmagan"; // Ownerlar faqat "tasdiqlanmagan" statusida qo'sha oladi
                                         // (Frontend "tasdiqlangan" yuborsa ham)
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
      RETURNING *`;

    const values = [
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      finalVenueStatus,
      finalOwnerId, // To'g'rilangan ownerId ni ishlatish
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ venue: result.rows[0] });
  } catch (error) {
    console.error("CREATE venue error:", error);
    // Agar owner_id mavjud bo'lmagan userga ishora qilsa (foreign key xatoligi)
    if (error.code === '23503') { // PostgreSQL da foreign key violation kodi
        return res.status(400).json({ message: "Ko'rsatilgan egasi (owner_id) mavjud emas." });
    }
    res.status(500).json({ message: "Server xatosi" });
  }
};

// ASSIGN OWNER (faqat admin)
exports.assignOwner = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Faqat admin owner biriktira oladi" });
    }

    const venueId = req.params.id;
    const { owner_id } = req.body;

    const ownerResult = await pool.query(
      "SELECT firstname, lastname, phone_number FROM users WHERE id = $1 AND role = 'owner'",
      [owner_id]
    );
    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ message: "Owner topilmadi" });
    }

    const owner = ownerResult.rows[0];

    const updateResult = await pool.query(
      `UPDATE venues SET owner_id = $1, phone_number = $2 WHERE id = $3 RETURNING *`,
      [owner_id, owner.phone_number, venueId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    res.json({ venue: updateResult.rows[0] });
  } catch (error) {
    console.error("Assign owner error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// APPROVE VENUE STATUS (faqat admin)
exports.approveVenue = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Faqat admin tasdiqlashi mumkin" });
    }

    const venueId = req.params.id;
    const { status } = req.body;

    if (!["tasdiqlangan", "tasdiqlanmagan", "pending"].includes(status)) {
      return res.status(400).json({ message: "Noto‘g‘ri status" });
    }

    const result = await pool.query(
      `UPDATE venues SET status = $1 WHERE id = $2 RETURNING *`,
      [status, venueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    res.json({ venue: result.rows[0] });
  } catch (error) {
    console.error("Approve venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// UPDATE VENUE
exports.updateVenue = async (req, res) => {
  try {
    const user = req.user;
    const venueId = req.params.id;
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      phone_number,
      status,
    } = req.body;

    // Faqat admin statusni o‘zgartirishi mumkin
    if (status && user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Faqat admin statusni o‘zgartirishi mumkin" });
    }

    const venueResult = await pool.query("SELECT * FROM venues WHERE id = $1", [
      venueId,
    ]);
    if (venueResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    const venue = venueResult.rows[0];

    // Owner faqat o‘zining to’yxonasi uchun o‘zgartirish kiritishi mumkin
    if (user.role === "owner" && venue.owner_id !== user.id) {
      return res
        .status(403)
        .json({ message: "Siz faqat o‘z to’yxonangizni o‘zgartira olasiz" });
    }

    const updateResult = await pool.query(
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
      [
        name,
        district_id,
        address,
        capacity,
        price_per_seat,
        phone_number,
        status,
        venueId,
      ]
    );

    res.json({ venue: updateResult.rows[0] });
  } catch (error) {
    console.error("Update venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// DELETE VENUE
exports.deleteVenue = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin o‘chirishi mumkin" });
    }

    const venueId = req.params.id;
    const deleteResult = await pool.query(
      "DELETE FROM venues WHERE id = $1 RETURNING *",
      [venueId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    res.json({ message: "To’yxona muvaffaqiyatli o‘chirildi" });
  } catch (error) {
    console.error("Delete venue error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};

// GET ALL VENUES (filter, sort, rolga qarab)
exports.getAllVenues = async (req, res) => {
  try {
    const user = req.user;
    const { status, sortBy, sortOrder, district_id } = req.query;

    // Asosiy so'rov qismlari
    let selectClause = `
      SELECT
        v.*,
        d.name AS district_name,
        u.firstname AS owner_firstname,
        u.lastname AS owner_lastname,
        ARRAY_AGG(vi.image_url) FILTER (WHERE vi.image_url IS NOT NULL) AS images 
        -- FILTER (WHERE vi.image_url IS NOT NULL) qo'shildi, bo'sh massivlar o'rniga null bo'lmagan rasmlarni yig'adi
    `;
    let fromClause = `
      FROM venues v
      JOIN districts d ON v.district_id = d.id
      LEFT JOIN users u ON v.owner_id = u.id
      LEFT JOIN venue_images vi ON vi.venue_id = v.id
    `;
    let whereClause = " WHERE 1=1"; // Har doim true bo'lgan shart, keyingi shartlarni "AND" bilan oson qo'shish uchun
    const values = [];
    let idx = 1;

    // Foydalanuvchi roli bo'yicha status sharti
    if (user.role === "user") {
      whereClause += ` AND v.status = 'tasdiqlangan'`;
    } else if (status) { // Agar admin/owner va status parametri kelsa
      whereClause += ` AND v.status = $${idx++}`;
      values.push(status);
    }

    // Rayon bo'yicha filter
    if (district_id) {
      whereClause += ` AND v.district_id = $${idx++}`;
      values.push(district_id);
    }

    // GROUP BY bandi
    let groupByClause = ` GROUP BY v.id, d.name, u.firstname, u.lastname`;

    // Tartiblash (ORDER BY) bandi
    const validSortFields = [
      "price_per_seat",
      "capacity",
      "district_name", // Bu d.name bo'lishi kerak, lekin GROUP BY da d.name borligi uchun OK
      "status",
      "name" // v.name bo'yicha tartiblash
    ];
    let orderClause = "";
    if (sortBy && validSortFields.includes(sortBy)) {
      const order =
        sortOrder && sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      // Agar sortBy "district_name" bo'lsa, d.name bo'yicha tartiblash kerak
      const sortField = sortBy === "district_name" ? "d.name" : `v.${sortBy}`;
      orderClause = ` ORDER BY ${sortField} ${order}`;
    } else {
      orderClause = ` ORDER BY v.created_at DESC`; // Standart tartiblash (masalan, yaratilgan vaqti bo'yicha)
    }

    // Yakuniy so'rovni yig'ish
    const finalQuery = selectClause + fromClause + whereClause + groupByClause + orderClause;

    console.log("Yuborilayotgan SQL so'rovi:", finalQuery); // SO'ROVNI KONSOLGA CHIQARING
    console.log("Parametrlar:", values);

    const result = await pool.query(finalQuery, values);

    res.json({ venues: result.rows });
  } catch (error) {
    console.error("Get all venues error:", error);
    res.status(500).json({ message: "Server xatosi", errorDetails: error.message }); // Xatolik haqida ko'proq ma'lumot
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venueResult = await pool.query(
      `SELECT
    v.*,
    d.name AS district_name,
    u.firstname AS owner_firstname,
    u.lastname AS owner_lastname,
    ARRAY_AGG(vi.image_url) FILTER (WHERE vi.image_url IS NOT NULL) AS images
FROM
    venues v
JOIN
    districts d ON v.district_id = d.id
LEFT JOIN
    users u ON v.owner_id = u.id
LEFT JOIN
    venue_images vi ON vi.venue_id = v.id
WHERE
    v.id = $1
GROUP BY
    v.id, d.name, u.firstname, u.lastname`,
      [id]
    );

    if (venueResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    const venue = venueResult.rows[0];

    res.json({ venue });
  } catch (error) {
    console.error("GET venue by id error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
