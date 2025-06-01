import React, { useEffect, useState } from "react";
import axios from "axios";

function GetBron() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:4001/users/getBron", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Bronni bekor qilmoqchimisiz?")) return;

    try {
      await axios.patch(
        `http://localhost:4001/users/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings(); 
    } catch (err) {
      alert(err.response?.data?.message || "Bekor qilishda xatolik yuz berdi");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (bookings.length === 0) return <p>Bronlar topilmadi</p>;

  const formatStatus = (status) => {
    switch (status) {
      case "bo‘lib o‘tgan":
        return "Bo‘lib o‘tgan";
      case "endi bo‘ladigan":
        return "Endi bo‘ladigan";
      case "bekor qilingan":
        return "Bekor qilingan";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-3xl font-bold mb-6">Bronlar ro‘yxati</h2>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-pink-200">
              <th className="border px-4 py-2">Bron ID</th>
              <th className="border px-4 py-2">To’yxona nomi</th>
              <th className="border px-4 py-2">Sana</th>
              <th className="border px-4 py-2">Odamlar soni</th>
              <th className="border px-4 py-2">Kim tomonidan</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-pink-50">
                <td className="border px-4 py-2 text-center">{b.id}</td>
                <td className="border px-4 py-2">{b.venue_name}</td>
                <td className="border px-4 py-2 text-center">
                  {new Date(b.reservation_date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2 text-center">
                  {b.guest_count}
                </td>
                <td className="border px-4 py-2">
                  {b.firstname && b.lastname
                    ? `${b.firstname} ${b.lastname} (${
                        b.phone_number || "Noma’lum"
                      })`
                    : "Siz"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {formatStatus(b.status)}
                </td>
                <td className="border px-4 py-2 text-center">
                  {b.status !== "bekor qilingan" && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                      Bekor qilish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GetBron;
