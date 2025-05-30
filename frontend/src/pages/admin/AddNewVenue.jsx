import React, { useState, useEffect } from "react";
import axios from "axios";

function AddNewVenue() {
  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    address: "",
    capacity: "",
    price_per_seat: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [ownerData, setOwnerData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    phone_number: "",
    role: "owner",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await axios.get("http://localhost:4001/districts");
        setDistricts(res.data.districts || []);
      } catch (err) {
        console.error("Districtlarni olishda xatolik:", err);
      }
    }
    fetchDistricts();
  }, []);

  useEffect(() => {
    return () => {
      selectedImages.forEach((imageObj) =>
        URL.revokeObjectURL(imageObj.previewUrl)
      );
    };
  }, [selectedImages]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOwnerChange = (e) => {
    setOwnerData({ ...ownerData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const currentTotalImages = selectedImages.length + files.length;
    if (currentTotalImages > 5) {
      alert(
        `Jami 5 ta rasm yuklashingiz mumkin. Siz ${files.length} ta tanladingiz, ${selectedImages.length} ta avval tanlangan.`
      );
      e.target.value = null;
      return;
    }

    const newImageFiles = files.map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prevImages) => [...prevImages, ...newImageFiles]);
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(selectedImages[indexToRemove].previewUrl);
    setSelectedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
        setError("Avtorizatsiya tokeni topilmadi. Iltimos, qayta kiring.");
        return;
    }

    try {
      // 1. Owner yaratish
      const newOwnerRes = await axios.post(
        "http://localhost:4001/auth/register",
        {
          firstname: ownerData.firstname,
          lastname: ownerData.lastname,
          username: ownerData.username,
          password: ownerData.password,
          phone_number: ownerData.phone_number,
          role: ownerData.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Owner yaratildi:", newOwnerRes.data);

      if (!newOwnerRes.data.user || !newOwnerRes.data.user.id) {
        throw new Error("Owner yaratishda xatolik yuz berdi (server javobi noto'g'ri).");
      }

      const ownerId = newOwnerRes.data.user.id;

      // 2. Venue yaratish
      const venueRes = await axios.post(
        "http://localhost:4001/venue",
        {
          ...formData,
          district_id: parseInt(formData.district_id),
          capacity: parseInt(formData.capacity),
          price_per_seat: parseFloat(formData.price_per_seat),
          owner_id: ownerId,
          status: "tasdiqlangan",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Venue yaratildi (rasmsiz javob):", venueRes.data);

      const venueId = venueRes.data.venue.id;

      // 3. Rasm yuklash
      if (selectedImages.length > 0) {
        console.log(`Yuklash uchun ${selectedImages.length} ta rasm tayyorlanmoqda...`);
        const formDataImg = new FormData();
        selectedImages.forEach((imageObj) => {
          formDataImg.append("images", imageObj.file);
        });

        console.log(`Rasmlar ${venueId} IDli to'yxonaga yuborilmoqda...`);
        const imageUploadRes = await axios.post( // Javobni oling
          `http://localhost:4001/venue/${venueId}/images`,
          formDataImg,
          { // AXIOS SO'ROVIGA HEADERS QO'SHILDI
            headers: {
              Authorization: `Bearer ${token}`,
              // "Content-Type": "multipart/form-data" - FormData uchun avtomatik qo'yiladi odatda
            },
          }
        );
        console.log("Rasm yuklash javobi:", imageUploadRes.data); // Server javobini log qiling
      } else {
        console.log("Yuklash uchun rasm tanlanmagan.");
      }

      setMessage("To’yxona muvaffaqiyatli qo‘shildi!");
      setOwnerData({
        firstname: "", lastname: "", username: "", password: "",
        phone_number: "", role: "owner",
      });
      setFormData({
        name: "", district_id: "", address: "", capacity: "",
        price_per_seat: "",
      });

      // Tanlangan rasmlarni tozalash va URL'larni bo'shatish
      selectedImages.forEach((imageObj) =>
        URL.revokeObjectURL(imageObj.previewUrl)
      );
      setSelectedImages([]);

    } catch (err) {
      console.error("Submit xatoligi:", err);
      if (err.response) {
        console.error("Server javobi (xatolik):", err.response.data);
        setError(
          err.response.data.message || "Serverdan xatolik javobi keldi."
        );
      } else if (err.request) {
        console.error("Serverdan javob kelmadi:", err.request);
        setError("Server bilan bog'lanib bo'lmadi.");
      } else {
        console.error("So'rovni sozlashda xatolik:", err.message);
        setError(err.message || "Kutilmagan xatolik yuz berdi.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Chap tomon - Owner */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">To’yxona Egasi</h2>
        {/* ... owner inputlari ... */}
        <div>
          <label className="block mb-1 font-medium">Ism</label>
          <input type="text" name="firstname" value={ownerData.firstname} onChange={handleOwnerChange} placeholder="Ism"
            className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Familiya</label>
          <input type="text" name="lastname" value={ownerData.lastname} onChange={handleOwnerChange} placeholder="Familiya"
            className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input type="text" name="username" value={ownerData.username} onChange={handleOwnerChange} placeholder="Username"
            className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" name="password" value={ownerData.password} onChange={handleOwnerChange} placeholder="Password"
            className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Telefon raqam</label>
          <input type="text" name="phone_number" value={ownerData.phone_number} onChange={handleOwnerChange} placeholder="Telefon raqam"
            className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
      </div>

      {/* o'ng tomon - Venue */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Yangi To’yxona Qo‘shish</h2>
        <form onSubmit={handleSubmit} className="space-y-4"> {/* encType olib tashlandi, FormData bilan kerak emas */}
          {/* ... venue inputlari ... */}
          <div>
            <label className="block mb-1 font-medium">To’yxona nomi</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Rayon</label>
            <select name="district_id" value={formData.district_id} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Rayonni tanlang</option>
              {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Manzil</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Sig‘im (o‘rindiqlar soni)</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Narx (1 o‘rindiq uchun)</label>
            <input type="number" step="0.01" name="price_per_seat" value={formData.price_per_seat} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              To’yxona rasmlari (5 ta gacha)
            </label>
            <input
              type="file" multiple accept="image/*" onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            {selectedImages.length > 0 && (
              <div className="mt-4 p-2 border border-dashed border-gray-300 rounded">
                <p className="text-sm text-gray-600 mb-2">Tanlangan rasmlar:</p>
                <div className="flex flex-wrap gap-4">
                  {selectedImages.map((imageObj, index) => (
                    <div key={index} className="relative group w-28 h-28">
                      <img src={imageObj.previewUrl} alt={`Tanlangan rasm ${index + 1}`}
                        className="w-full h-full object-cover rounded shadow-md" />
                      <button type="button" onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                        aria-label="Rasmni o'chirish">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">
            Qo‘shish
          </button>
          {message && <p className="text-green-600 mt-2">{message}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default AddNewVenue;