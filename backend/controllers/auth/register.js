const pool = require("../../config/db");
const bcrypt = require("bcryptjs");

async function register(req, res) {
  try {
    const { firstname, lastname, username, password, role, phone_number } = req.body;

    // Maydonlarning to'ldirilganligini tekshirish
    if (!firstname || !lastname || !username || !password || !role) {
      return res.status(400).json({ message: "Hamma maydonlar to‘ldirilishi shart" });
    }

    // Foydalanuvchi mavjudligini tekshirish
    const existingUser = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Bunday username allaqachon mavjud" });
    }

    // Parolni hash'lash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yangi foydalanuvchini bazaga qo'shish va kerakli maydonlarni qaytarish
    const newUserQuery = await pool.query(
      `INSERT INTO users (firstname, lastname, username, password_hash, role, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, firstname, lastname, username, role, phone_number`, // Qaytariladigan maydonlar
      [firstname, lastname, username, hashedPassword, role, phone_number]
    );

    // Yangi qo'shilgan foydalanuvchi ma'lumotlari
    const newUser = newUserQuery.rows[0];

    // Muvaffaqiyatli javobni foydalanuvchi ma'lumotlari bilan birga yuborish
    res.status(201).json({
      message: "Ro‘yxatdan o‘tish muvaffaqiyatli bajarildi",
      user: newUser // Foydalanuvchi obyektini javobga qo'shish
    });

  } catch (error) {
    console.error("Register error:", error);
    // Xatolikni aniqroq log qilish foydali bo'lishi mumkin
    // Masalan, if (error.code === '23505') { /* unique constraint violation */ }
    res.status(500).json({ message: "Serverda ichki xatolik" });
  }
}

module.exports = register;