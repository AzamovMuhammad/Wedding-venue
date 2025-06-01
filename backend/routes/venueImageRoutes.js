const express = require("express");
const router = express.Router();

const uploadFiles = require("../middleware/uploadFiles"); // bu middleware

const { uploadVenueImages } = require("../controllers/Venue/venueImageController");
const { authentication } = require("../middleware/authentication");
const { checkRole } = require("../middleware/checkRole");

router.post(
  "/:venueId/images",
  authentication,
  checkRole("admin", "owner"),
  uploadFiles,  
  uploadVenueImages
);

module.exports = router;
