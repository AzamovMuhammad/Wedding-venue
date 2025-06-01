const pool = require("../../config/db");
const bcrypt = require("bcryptjs");

async function register(req, res) {
  try {
    const { firstname, lastname, username, password, role, phone_number } = req.body;

    if (!firstname || !lastname || !username || !password || !role) {
      return res.status(400).json({ message: "Hamma maydonlar to‘ldirilishi shart" });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Bunday username allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserQuery = await pool.query(
      `INSERT INTO users (firstname, lastname, username, password_hash, role, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, firstname, lastname, username, role, phone_number`, 
      [firstname, lastname, username, hashedPassword, role, phone_number]
    );

    const newUser = newUserQuery.rows[0];

    res.status(201).json({
      message: "Ro‘yxatdan o‘tish muvaffaqiyatli bajarildi",
      user: newUser 
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Serverda ichki xatolik" });
  }
}

module.exports = register;