const express = require("express");
const { getProfile } = require("../controllers/profileInfo/info");
const { authentication } = require("../middleware/authentication");
const router = express.Router();

router.get("/info", authentication, getProfile);

module.exports = router;
