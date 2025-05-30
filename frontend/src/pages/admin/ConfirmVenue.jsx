import React, { useEffect, useState } from "react";
import axios from "axios";

function PendingVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPendingVenues() {
      try {
        const res = await axios.get("http://localhost:4001/venue/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVenues(res.data.venues || []);
      } catch (err) {
        setError(err.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    fetchPendingVenues();
  }, [token]);

  const handleApprove = async (venueId, newStatus) => {
    setMessage("");
    setError("");

    try {
      await axios.patch(
        `http://localhost:4001/venue/${venueId}/approve`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Status muvaffaqiyatli yangilandi");

      setVenues((prev) =>
        prev.map((v) =>
          v.id === venueId ? { ...v, status: newStatus } : v
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Yangilashda xatolik yuz berdi");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Tasdiqlanmagan To’yxonalar</h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {venues.length === 0 ? (
        <p>Hozircha tasdiqlanmagan to’yxonalar yo‘q.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Nomi</th>
              <th className="border border-gray-300 px-4 py-2">Rayon</th>
              <th className="border border-gray-300 px-4 py-2">Egasi</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((venue) => (
              <tr key={venue.id}>
                <td className="border border-gray-300 px-4 py-2">{venue.name}</td>
                <td className="border border-gray-300 px-4 py-2">{venue.district_name}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {venue.owner_firstname} {venue.owner_lastname}
                </td>
                <td className="border border-gray-300 px-4 py-2">{venue.status}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={() => handleApprove(venue.id, "tasdiqlangan")}
                  >
                    Tasdiqlash
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleApprove(venue.id, "tasdiqlanmagan")}
                  >
                    Rad etish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PendingVenues;
