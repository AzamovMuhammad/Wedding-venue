// routes/ownerRoutes.js (yoki sizning faylingiz nomi)
const express = require("express");
const router = express.Router();
const { addOwnVenue } = require("../controllers/Owner/addOwnVenue"); // Kontroler importi
const { authentication } = require("../middleware/authentication"); // Autentifikatsiya middleware
const { checkRole } = require("../middleware/checkRole");       // Rol tekshirish middleware

// To'yxona matnli ma'lumotlarini yaratish uchun POST endpoint
// MULTER (uploadFiles) BU YERDA ISHLATILMAYDI
router.post(
  "/addVenue", // Endpoint: POST /owner/addVenue (agar app.js da app.use('/owner', ownerRoutes) bo'lsa)
  authentication,
  checkRole("admin", "owner"), // Faqat admin yoki owner kira oladi
  addOwnVenue                  // O'zgartirilgan kontroler
);

module.exports = router;