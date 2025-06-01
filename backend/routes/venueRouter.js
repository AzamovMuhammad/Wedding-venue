const express = require("express");
const router = express.Router();

const {
  createVenue,
  assignOwner,
  approveVenue,
  updateVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
  getPendingVenues,
} = require("../controllers/Venue/venueController");

const {uploadVenueImages} = require("../controllers/Venue/venueImageController")

const uploadFilesMiddleware = require('../middleware/uploadFiles');
const { authentication } = require("../middleware/authentication");
const { checkRole } = require("../middleware/checkRole");

// Yangi venue qo‘shish (admin va owner)
router.post("/", authentication, checkRole("admin", "owner"), createVenue);

// Owner biriktirish (faqat admin)
router.patch("/:id/assign-owner", authentication, checkRole("admin"), assignOwner);

// Venue tasdiqlash (faqat admin)
router.patch("/:id/approve", authentication, checkRole("admin"), approveVenue);

router.get("/pending", authentication, checkRole("admin"), getPendingVenues);

// Venue ma’lumotlarini o‘zgartirish (admin va owner)
router.put("/:id", authentication, checkRole("admin", "owner"), updateVenue);

// Venue o‘chirish (faqat admin)
router.delete("/:id", authentication, checkRole("admin"), deleteVenue);

// Bitta venue ni olish (hamma uchun, lekin authentication talab qilinadi)
router.get("/:id", authentication, getVenueById);

// Venue lar ro‘yxatini olish, filterlash, tartiblash (hamma uchun)
router.get("/", authentication, getAllVenues);

router.post(
  "/:venueId/images", 
  authentication,
  checkRole("admin", "owner"), 
  uploadFilesMiddleware,       
  uploadVenueImages            
);


module.exports = router;