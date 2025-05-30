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
  getPendingVenues, // <--- uploadVenueImages controllerini import qiling
} = require("../controllers/Venue/venueController"); // Controller faylingizga to'g'ri yo'lni ko'rsating

const {uploadVenueImages} = require("../controllers/Venue/venueImageController")

const uploadFilesMiddleware = require('../middleware/uploadFiles'); // <--- Multer middleware'ini import qiling (to'g'ri yo'lni ko'rsating)
const { authentication } = require("../middleware/authentication"); // To'g'ri yo'lni ko'rsating
const { checkRole } = require("../middleware/checkRole"); // To'g'ri yo'lni ko'rsating

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


// **** YANGI MARSHRUT: To'yxona uchun rasmlarni yuklash ****
router.post(
  "/:venueId/images", // Frontend ishlatayotgan yo'l
  authentication,
  checkRole("admin", "owner"), // Admin yoki to'yxona egasi rasm yuklashi mumkin
  uploadFilesMiddleware,       // Multer middleware fayllarni qayta ishlaydi
  uploadVenueImages            // Controller funksiyasi rasmlarni bazaga saqlaydi
);
// **********************************************************

module.exports = router;