const express = require("express");
const router = express.Router();

const { getAll } = require("../controllers/admin/getAll");

router.get("/allUser", getAll);

module.exports = router;
