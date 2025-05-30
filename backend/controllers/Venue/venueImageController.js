const pool = require("../../config/db"); // To'g'ri yo'lni ko'rsating

exports.uploadVenueImages = async (req, res) => {
  try {
    const venueId = req.params.venueId;
    if (!req.user || !req.user.role || !req.user.id) {
      console.error("uploadVenueImages: Autentifikatsiya ma'lumotlari topilmadi!");
      return res.status(401).json({
        message:
          "Autentifikatsiya qilinmagan yoki foydalanuvchi ma'lumotlari to'liq emas.",
      });
    }
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log(`uploadVenueImages: venueId='${venueId}', userRole='${userRole}', userId='${userId}'`);

    const venueResult = await pool.query(
      "SELECT id, owner_id FROM venues WHERE id = $1",
      [venueId]
    );
    if (venueResult.rows.length === 0) {
      console.error(`uploadVenueImages: To'yxona topilmadi, venueId='${venueId}'`);
      return res.status(404).json({ message: "To’yxona topilmadi" });
    }
    const venue = venueResult.rows[0];

    if (userRole === "owner" && venue.owner_id !== userId) {
      console.error(`uploadVenueImages: Huquq yo'q, venue.owner_id='${venue.owner_id}', userId='${userId}'`);
      return res.status(403).json({
        message: "Siz faqat o‘z to’yxonangiz uchun surat yuklashingiz mumkin",
      });
    }

    console.log("uploadVenueImages controllerida req.files:", req.files);

    if (!req.files || req.files.length === 0) {
      console.error("uploadVenueImages: req.files bo'sh yoki mavjud emas!");
      return res.status(400).json({ message: "Hech qanday fayl yuklanmadi. Fayl tanlanganiga ishonch hosil qiling." });
    }

    console.log(`uploadVenueImages: ${req.files.length} ta fayl bazaga yozish uchun tayyor.`);

    const insertPromises = req.files.map((file) => {
      const imageUrl = `/uploads/${file.filename}`;
      // Quyidagi console.log dagi <span class="math-inline">...</span> qismi xato bo'lishi mumkin, to'g'rilaymiz:
      console.log(`Bazaga yozishga harakat: venue_id=${venueId}, image_url=${imageUrl}`);
      return pool.query(
        "INSERT INTO venue_images (venue_id, image_url) VALUES ($1, $2) RETURNING *",
        [venueId, imageUrl]
      );
    });

    console.log("Bazaga yozish uchun so'rovlar tayyor.");
    const insertedImageResults = await Promise.all(insertPromises);
    console.log(
      "Bazaga muvaffaqiyatli yozildi (natijalar):", // "muvaffaqiyatli" degan xabar aldamchi bo'lishi mumkin, agar insertedImageResults bo'sh bo'lsa yoki xato bo'lsa
      insertedImageResults.map(r => r.rows[0])
    );

    res.status(201).json({
      message: `${req.files.length} ta surat muvaffaqiyatli yuklandi`,
      uploadedImages: insertedImageResults.map(r => r.rows[0])
    });

  } catch (error) {
    // BU ENG MUHIM LOG! XATOLIKNI TO'LIQ CHIQARING!
    console.error("--- VENUE IMAGE UPLOAD ERROR (catch bloki) ---");
    console.error("Xatolik Xabari:", error.message);
    console.error("Xatolik KODI (agar mavjud bo'lsa, masalan, PostgreSQL xato kodi):", error.code);
    console.error("Xatolik Detali (PostgreSQL):", error.detail);
    console.error("Xatolik Cheklovi (PostgreSQL):", error.constraint);
    console.error("To'liq Xatolik (Stack Trace):", error.stack);
    console.error("--- XATOLIK LOGI TUGADI ---");

    if (error instanceof multer.MulterError) {
      return res // Bu return muhim, javob yuborilgandan keyin boshqa javob yuborilmasligi uchun
        .status(400)
        .json({ message: `Fayl yuklashda Multer xatoligi: ${error.message}` });
    } else { // Agar MulterError bo'lmasa, umumiy server xatosi
      return res.status(500).json({ message: "Serverda ichki xatolik yuz berdi", errorDetails: error.message });
    }
    // Eski kodda bu yerda yana bir res.status(500) bor edi, u olib tashlandi.
  }
};