// routes/districtRoutes.js
const express = require("express");
const router = express.Router();
const {districtsController } = require("../controllers/Districts/districtsController");

router.get("/", districtsController);

module.exports = router;
