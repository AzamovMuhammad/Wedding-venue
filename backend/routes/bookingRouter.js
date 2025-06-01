const express = require("express");
const { authentication } = require("../middleware/authentication");
const { getAllBookingsDates } = require("../controllers/Venue/bookingDate");
const router = express.Router();


// Barcha bron qilingan sanalarni olish - barcha foydalanuvchilar uchun
router.get("/booked-dates", authentication, getAllBookingsDates);

module.exports = router;
