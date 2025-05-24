const pool = require('../../config/db');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT firstname, lastname, username FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Xatolik:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getProfile };
