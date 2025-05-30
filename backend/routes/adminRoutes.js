const express = require("express");
const router = express.Router();

const { getAll } = require("../controllers/admin/getAll");
const { getOwners } = require("../controllers/admin/getAllVenueOwner");

router.get("/allUser", getAll);
router.get('/allOwner', getOwners)

module.exports = router;
