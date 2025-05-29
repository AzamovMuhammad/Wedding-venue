import React, { useState, useEffect } from "react";
import axios from "axios";

function AssignOwner({ venueId }) {
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await axios.get("http://localhost:4001/users?role=owner", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwners(res.data.users || []);
      } catch (err) {
        console.error("Ownerlarni olishda xatolik:", err);
      }
    }
    fetchOwners();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedOwnerId) {
      setError("Iltimos, ownerni tanlang");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:4001/venues/${venueId}/assign-owner`,
        { owner_id: selectedOwnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Owner muvaffaqiyatli biriktirildi");
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">To’yxona egasini biriktirish</h2>

      {message && <p className="text-green-600 mb-3">{message}</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Ownerni tanlang:</label>
        <select
          value={selectedOwnerId}
          onChange={(e) => setSelectedOwnerId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        >
          <option value="">-- Tanlang --</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.firstname} {owner.lastname} ({owner.phone_number})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
        >
          Biriktirish
        </button>
      </form>
    </div>
  );
}

export default AssignOwner;
