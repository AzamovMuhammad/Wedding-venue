const express = require("express");
const router = express.Router();

const {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} = require("../controllers/Venue/venueController");

const { authentication } = require("../middleware/authentication");
const { checkRole } = require("../middleware/checkRole");

// CREATE — faqat admin va owner
router.post("/", authentication, checkRole("admin", "owner"), createVenue);

// READ all — hamma uchun, lekin faqat tasdiqlanganlar foydalanuvchi uchun
router.get("/", authentication, getAllVenues);

// READ one
router.get("/:id", authentication, getVenueById);

// UPDATE — faqat admin va owner
router.put("/:id", authentication, checkRole("admin", "owner"), updateVenue);

// DELETE — faqat admin
router.delete("/:id", authentication, checkRole("admin"), deleteVenue);

module.exports = router;
