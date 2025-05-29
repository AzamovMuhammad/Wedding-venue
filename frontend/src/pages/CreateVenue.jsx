import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useVenueStore from "../zustand/store";

function CreateVenue() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    address: "",
    capacity: "",
    price_per_seat: "",
    phone_number: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const setVenueId = useVenueStore((state) => state.setVenueId);

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await axios.get("http://localhost:4001/districts");
        setDistricts(res.data.districts);
      } catch (err) {
        console.error("Districts olishda xatolik:", err);
      }
    }
    fetchDistricts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:4001/venue/",
        {
          name: formData.name,
          district_id: parseInt(formData.district_id),
          address: formData.address,
          capacity: parseInt(formData.capacity),
          price_per_seat: parseFloat(formData.price_per_seat),
          phone_number: formData.phone_number,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const venueID = res.data.venue.id;
      setVenueId(venueID);

      setMessage("To’yxona muvaffaqiyatli qo‘shildi!");
      setFormData({
        name: "",
        district_id: "",
        address: "",
        capacity: "",
        price_per_seat: "",
        phone_number: "",
      });

    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
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
        <input
          type="text"
          name="name"
          placeholder="To’yxona nomi"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
        />

        <select
          name="district_id"
          value={formData.district_id}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none">
          <option value="">Rayonni tanlang</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="address"
          placeholder="e.g. Husayn Boyqaro koʻchasi"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
        />

        <input
          type="number"
          name="capacity"
          placeholder="Sig‘im (o‘rindiqlar soni)"
          value={formData.capacity}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
        />

        <input
          type="number"
          step="0.01"
          name="price_per_seat"
          placeholder="Narx (1 o‘rindiq uchun)"
          value={formData.price_per_seat}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
        />

        <input
          type="text"
          name="phone_number"
          placeholder="Telefon raqam"
          value={formData.phone_number}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-white border border-pink-700 hover:bg-pink-700 text-pink-700 hover:text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            onClick={() => {
              navigate("/uploadImg");
            }}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
          >
            Qo‘shish
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateVenue;
