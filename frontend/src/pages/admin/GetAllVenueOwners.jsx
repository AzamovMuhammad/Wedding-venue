import React, { useEffect, useState } from "react";
import axios from "axios";

function GetAllVenueOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await axios.get("http://localhost:4001/admin/allOwner?role=owner", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOwners(res.data.owners || []);
      } catch (err) {
        console.error("Ownerlarni olishda xatolik:", err);
        setError(err.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    fetchOwners();
  }, [token]);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">To’yxona Egalar Ro’yxati</h2>
      {owners.length === 0 ? (
        <p>Hozircha egalar mavjud emas.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Ism</th>
              <th className="border border-gray-300 px-4 py-2">Familiya</th>
              <th className="border border-gray-300 px-4 py-2">Username</th>
              <th className="border border-gray-300 px-4 py-2">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id}>
                <td className="border border-gray-300 px-4 py-2">{owner.firstname}</td>
                <td className="border border-gray-300 px-4 py-2">{owner.lastname}</td>
                <td className="border border-gray-300 px-4 py-2">{owner.username}</td>
                <td className="border border-gray-300 px-4 py-2">{owner.phone_number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GetAllVenueOwners;
