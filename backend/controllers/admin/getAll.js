const pool = require("../../config/db");

exports.getAll = async (req, res) => {
  try {
    result = await pool.query("select * from Users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
