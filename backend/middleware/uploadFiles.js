const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const uploadFiles = upload.array("images", 5); // 'images' frontenddagi input nomi

module.exports = uploadFiles; // to‘g‘ridan-to‘g‘ri middleware sifatida eksport
