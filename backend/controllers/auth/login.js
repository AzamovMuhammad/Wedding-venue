const pool = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "super_secret_key"; // Agar .env ishlatsangiz, process.env.JWT_SECRET bo'ladi

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username va password kerak" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Username yoki parol noto‘g‘ri" });
    }

    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);

    if (!validPass) {
      return res.status(401).json({ message: "Username yoki parol noto‘g‘ri" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
}

module.exports = login;
