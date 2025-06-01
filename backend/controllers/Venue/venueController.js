const pool = require("../../config/db");

exports.createVenue = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const {
      name,
      district_id,
      address,
      capacity,
      price_per_seat,
      status,
      owner_id,
    } = req.body;

    if (!name || !district_id || !address || !capacity || !price_per_seat) {
      return res
        .status(400)
        .json({ message: "Kerakli maydonlar to‘ldirilmagan" });
    }

    let finalOwnerId;
    let finalVenueStatus;

    if (loggedInUser.role === "admin") {
      finalOwnerId = owner_id || null; 
      finalVenueStatus = status || "pending"; 
    } else if (loggedInUser.role === "owner") {
      finalOwnerId = loggedInUser.id;
      finalVenueStatus = "tasdiqlanmagan";
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
      finalOwnerId,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ venue: result.rows[0] });
  } catch (error) {
    console.error("CREATE venue error:", error);
    if (error.code === '23503') {
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

exports.getPendingVenues = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin ko‘rishi mumkin" });
    }

    const result = await pool.query(
      `SELECT v.*, d.name as district_name, u.firstname as owner_firstname, u.lastname as owner_lastname
       FROM venues v
       JOIN districts d ON v.district_id = d.id
       LEFT JOIN users u ON v.owner_id = u.id
       WHERE v.status IN ('pending', 'tasdiqlanmagan')`
    );

    res.json({ venues: result.rows });
  } catch (error) {
    console.error("Get pending venues error:", error);
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
      status,
    } = req.body;

    const venueResult = await pool.query("SELECT * FROM venues WHERE id = $1", [
      venueId,
    ]);
    if (venueResult.rows.length === 0) {
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }

    const venue = venueResult.rows[0];

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
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [
        name,
        district_id,
        address,
        capacity,
        price_per_seat,
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

    let selectClause = `
      SELECT
        v.*,
        d.name AS district_name,
        u.firstname AS owner_firstname,
        u.lastname AS owner_lastname,
        ARRAY_AGG(vi.image_url) FILTER (WHERE vi.image_url IS NOT NULL) AS images 
    `;
    let fromClause = `
      FROM venues v
      JOIN districts d ON v.district_id = d.id
      LEFT JOIN users u ON v.owner_id = u.id
      LEFT JOIN venue_images vi ON vi.venue_id = v.id
    `;
    let whereClause = " WHERE 1=1";
    const values = [];
    let idx = 1;

    if (user.role === "user") {
      whereClause += ` AND v.status = 'tasdiqlangan'`;
    } else if (status) { 
      whereClause += ` AND v.status = $${idx++}`;
      values.push(status);
    }

    if (district_id) {
      whereClause += ` AND v.district_id = $${idx++}`;
      values.push(district_id);
    }

    let groupByClause = ` GROUP BY v.id, d.name, u.firstname, u.lastname`;

    const validSortFields = [
      "price_per_seat",
      "capacity",
      "district_name",
      "status",
      "name"
    ];
    let orderClause = "";
    if (sortBy && validSortFields.includes(sortBy)) {
      const order =
        sortOrder && sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      const sortField = sortBy === "district_name" ? "d.name" : `v.${sortBy}`;
      orderClause = ` ORDER BY ${sortField} ${order}`;
    } else {
      orderClause = ` ORDER BY v.created_at DESC`;
    }

    const finalQuery = selectClause + fromClause + whereClause + groupByClause + orderClause;

    const result = await pool.query(finalQuery, values);

    res.json({ venues: result.rows });
  } catch (error) {
    console.error("Get all venues error:", error);
    res.status(500).json({ message: "Server xatosi", errorDetails: error.message });
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
