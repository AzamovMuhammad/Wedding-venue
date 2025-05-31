import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useVenueStore from "../../zustand/store"; // O'zingizning store import yo'lingizni tekshiring

function CreateVenue() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    address: "",
    capacity: "",
    price_per_seat: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const MAX_IMAGES = 5;

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  // const setVenueId = useVenueStore((state) => state.setVenueId); // Agar kerak bo'lsa

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await axios.get("http://localhost:4001/districts", { // Portingizni tekshiring
            headers: { Authorization: `Bearer ${token}` }
        });
        setDistricts(res.data.districts);
      } catch (err) {
        console.error("Districts olishda xatolik:", err);
        setError("Tumanlarni yuklashda xatolik yuz berdi.");
      }
    }
    if (token) { // Token mavjud bo'lsagina districts so'rovini yuborish
        fetchDistricts();
    }
  }, [token]);

  useEffect(() => {
    return () => {
      selectedImages.forEach(imageObj => URL.revokeObjectURL(imageObj.previewUrl));
    };
  }, [selectedImages]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageObjects = [];
    let currentImageCount = selectedImages.length;

    if (currentImageCount + files.length > MAX_IMAGES) {
      setError(`Siz faqat ${MAX_IMAGES} tagacha rasm yuklashingiz mumkin.`);
      files.splice(MAX_IMAGES - currentImageCount);
    } else {
      setError("");
    }

    files.forEach(file => {
      if (file.type.startsWith("image/") && currentImageCount < MAX_IMAGES) {
        newImageObjects.push({
          file: file,
          previewUrl: URL.createObjectURL(file)
        });
        currentImageCount++;
      }
    });

    if (newImageObjects.length > 0) {
      setSelectedImages(prevImages => [...prevImages, ...newImageObjects]);
    }
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages(prevImages =>
      prevImages.filter((imageObj, index) => {
        if (index === indexToRemove) {
          URL.revokeObjectURL(imageObj.previewUrl);
          return false;
        }
        return true;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    // 1-QADAM: To'yxona matnli ma'lumotlarini yuborish
    try {
      const venueDetailsPayload = {
        name: formData.name,
        district_id: parseInt(formData.district_id),
        address: formData.address,
        capacity: parseInt(formData.capacity),
        price_per_seat: parseFloat(formData.price_per_seat),
      };
      
      console.log("Sending venue details:", venueDetailsPayload);

      const venueDetailsResponse = await axios.post(
        // Backenddagi `ownerRoutes` ga mos endpoint
        "http://localhost:4001/users/addVenue", // PORTINGIZNI VA YO'LINGIZNI TEKSHIRING
        venueDetailsPayload, // JSON obyekt
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newVenue = venueDetailsResponse.data.venue;
      const venueID = newVenue.id;
      // setVenueId(venueID); // Agar kerak bo'lsa
      setMessage(venueDetailsResponse.data.message || "To’yxona ma'lumotlari saqlandi.");
      console.log("Venue details saved, ID:", venueID);

      // 2-QADAM: Rasmlarni yuborish (agar tanlangan bo'lsa)
      if (selectedImages.length > 0 && venueID) {
        const imagesFormData = new FormData();
        selectedImages.forEach((imageObj) => {
          imagesFormData.append("images", imageObj.file);
        });
        
        console.log(`Uploading ${selectedImages.length} images for venue ID: ${venueID}`);

        await axios.post(
          // Backenddagi `venueImageRoutes` ga mos endpoint
          `http://localhost:4001/venues/${venueID}/images`, // PORTINGIZNI TEKSHIRING
          imagesFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessage("To’yxona va rasmlar muvaffaqiyatli qo‘shildi!");
        console.log("Images uploaded successfully.");

        // Formani tozalash
        setFormData({
          name: "", district_id: "", address: "", capacity: "",
          price_per_seat: "",
        });
        selectedImages.forEach(imageObj => URL.revokeObjectURL(imageObj.previewUrl));
        setSelectedImages([]);

      } else if (selectedImages.length === 0 && venueID) {
        setMessage("To’yxona ma'lumotlari rasmlarsiz saqlandi. Rasmlar tanlanmagan.");
        setFormData({
            name: "", district_id: "", address: "", capacity: "",
            price_per_seat: "",
        });
      }

    } catch (apiError) {
      console.error("API Error during submit:", apiError);
      let errorMessage = "Xatolik yuz berdi.";
      if (apiError.response && apiError.response.data && apiError.response.data.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-18"> {/* Tailwind klassi */}
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-pink-700 mb-6">
          Yangi To’yxona Qo‘shish
        </h2>

        {message && (
          <p className="text-green-600 text-sm text-center mb-2">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-sm text-center mb-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* To'yxona nomi */}
          <input
            type="text"
            name="name"
            placeholder="To’yxona nomi"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Rayon tanlash */}
          <select
            name="district_id"
            value={formData.district_id}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          >
            <option value="">Rayonni tanlang</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>

          {/* Manzil */}
          <input
            type="text"
            name="address"
            placeholder="e.g. Husayn Boyqaro koʻchasi"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Sig'im */}
          <input
            type="number"
            name="capacity"
            placeholder="Sig‘im (o‘rindiqlar soni)"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Narx */}
          <input
            type="number"
            step="0.01"
            name="price_per_seat"
            placeholder="Narx (1 o‘rindiq uchun)"
            value={formData.price_per_seat}
            onChange={handleChange}
            required
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* --- Rasm Yuklash Qismi --- */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              To’yxona rasmlari ({MAX_IMAGES} ta gacha)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-lg mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {selectedImages.length > 0 && (
              <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Tanlangan rasmlar:</p>
                <div className="flex flex-wrap gap-4">
                  {selectedImages.map((imageObj, index) => (
                    <div key={index} className="relative group w-28 h-28"> {/* index ni key sifatida ishlatish mumkin */}
                      <img src={imageObj.previewUrl} alt={`Tanlangan rasm ${index + 1}`}
                        className="w-full h-full object-cover rounded-md shadow-md" />
                      <button type="button" onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 focus:opacity-100 focus:outline-none"
                        aria-label="Rasmni o'chirish">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* --- Rasm Yuklash Qismi Tugadi --- */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")} // Asosiy sahifaga yoki boshqa joyga
              disabled={isSubmitting}
              className="w-full bg-white border border-pink-600 hover:bg-pink-50 text-pink-600 font-semibold py-3 rounded-lg transition duration-300 cursor-pointer disabled:opacity-50">
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer disabled:opacity-70">
              {isSubmitting ? "Yuborilmoqda..." : "Qo‘shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVenue;