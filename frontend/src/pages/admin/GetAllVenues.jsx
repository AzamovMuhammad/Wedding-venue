import React, { useEffect, useState } from "react";
import axios from "axios";

function GetAllVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await axios.get("http://localhost:4001/venue", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVenues(res.data.venues || []);
      } catch (err) {
        setError(err.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, [token]);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (venues.length === 0) return <p>Hech qanday to’yxona topilmadi</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Barcha To’yxonalar</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-pink-200">
            <th className="border border-gray-300 px-4 py-2">Rasm</th>
            <th className="border border-gray-300 px-4 py-2">Nomi</th>
            <th className="border border-gray-300 px-4 py-2">Rayon</th>
            <th className="border border-gray-300 px-4 py-2">Manzil</th>
            <th className="border border-gray-300 px-4 py-2">Sig‘im</th>
            <th className="border border-gray-300 px-4 py-2">Narx (so‘m)</th>
            <th className="border border-gray-300 px-4 py-2">Telefon</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Egasi</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => {
            // Birinchi rasmni olish (agar images array bo'lsa)
            const firstImage =
              venue.images && venue.images.length > 0
                ? venue.images[0]
                : null;
            return (
              <tr key={venue.id} className="hover:bg-pink-100 cursor-pointer">
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {firstImage ? (
                    <img
                      src={`http://localhost:4001${firstImage}`}
                      alt={`${venue.name} rasmi`}
                      className="w-20 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Rasm yo‘q</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">{venue.name}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.district_name}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.address}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.capacity}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.price_per_seat}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.phone_number || "Noma’lum"}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {venue.owner_firstname} {venue.owner_lastname}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default GetAllVenues;
