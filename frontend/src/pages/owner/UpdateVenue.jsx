import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function UpdateVenues() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    address: "",
    capacity: "",
    price_per_seat: "",
    status: "",
  });

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchVenueAndDistricts() {
      try {
        const venueRes = await axios.get(`http://localhost:4001/venue/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Venue from API:", venueRes.data);
        if (!venueRes.data.venue) throw new Error("Venue ma'lumotlari topilmadi");
  
        setFormData({
          name: venueRes.data.venue.name || "",
          district_id: venueRes.data.venue.district_id || "",
          address: venueRes.data.venue.address || "",
          capacity: venueRes.data.venue.capacity || "",
          price_per_seat: venueRes.data.venue.price_per_seat || "",
          status: venueRes.data.venue.status || "",
        });
  
        const districtsRes = await axios.get("http://localhost:4001/districts");
        setDistricts(districtsRes.data.districts || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  
    fetchVenueAndDistricts();
  }, [id, token]);
  
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.put(
        `http://localhost:4001/venue/${id}`,
        {
          ...formData,
          district_id: parseInt(formData.district_id),
          capacity: parseInt(formData.capacity),
          price_per_seat: parseFloat(formData.price_per_seat),
          status: formData.status, // faqat admin uchun kerak bo‘lsa o‘zgartirish mumkin
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("To’yxona muvaffaqiyatli yangilandi!");
    } catch (err) {
      setError(err.response?.data?.message || "Yangilashda xatolik yuz berdi");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">To’yxona ma’lumotlarini o’zgartirish</h2>

      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">To’yxona nomi</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Rayon</label>
          <select
            name="district_id"
            value={formData.district_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Rayonni tanlang</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Manzil</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Sig‘im (o‘rindiqlar soni)</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Narx (1 o‘rindiq uchun)</label>
          <input
            type="number"
            step="0.01"
            name="price_per_seat"
            value={formData.price_per_seat}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>


        {localStorage.getItem("role") === "admin" && (
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="tasdiqlangan">Tasdiqlangan</option>
              <option value="tasdiqlanmagan">Tasdiqlanmagan</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
        >
          Saqlash
        </button>
      </form>
    </div>
  );
}

export default UpdateVenues;
