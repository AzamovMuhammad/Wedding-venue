const express = require("express");
const router = express.Router();
const { addOwnVenue } = require("../controllers/Owner/addOwnVenue");
const { authentication } = require("../middleware/authentication"); 
const { checkRole } = require("../middleware/checkRole");  
const { addOwnBrons } = require("../controllers/Users/addOwnBrons");
const { getBron } = require("../controllers/Users/getOwnBrons");
const { cancelBron } = require("../controllers/Users/cencelOwnBrons");


router.post("/addVenue",authentication, checkRole("admin", "owner"), addOwnVenue);

// Bron yaratish (faqat foydalanuvchilar uchun)
router.post("/bron", authentication, checkRole("user", "owner", "admin"), addOwnBrons);

// Bronlarni ko'rish (admin uchun hamma, foydalanuvchi faqat o'z bronlari)
router.get("/getBron", authentication, checkRole("user", "owner", "admin"), getBron);

// Bronni bekor qilish
router.patch("/:id/cancel", authentication, checkRole("user", "owner", "admin"), cancelBron);

module.exports = router;