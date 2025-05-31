import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function VenueDetails() {
  const { id } = useParams(); // URL parametridan venue id olish
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchVenue() {
      try {
        const res = await axios.get(`http://localhost:4001/venue/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVenue(res.data.venue);
      } catch (err) {
        setError(err.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    fetchVenue();
  }, [id, token]);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!venue) return <p>To’yxona topilmadi</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-3xl font-bold mb-4">{venue.name}</h2>
      <p className="mb-2"><strong>Rayon:</strong> {venue.district_name}</p>
      <p className="mb-2"><strong>Manzil:</strong> {venue.address}</p>
      <p className="mb-2"><strong>Sig‘im:</strong> {venue.capacity}</p>
      <p className="mb-2"><strong>Narx (1 o‘rindiq):</strong> {venue.price_per_seat} so‘m</p>
      <p className="mb-2"><strong>Telefon:</strong> {venue.phone_number || "Ko‘rsatilmagan"}</p>
      <p className="mb-2"><strong>Egasi:</strong> {venue.owner_firstname} {venue.owner_lastname}</p>
      <p className="mb-2"><strong>Status:</strong> {venue.status}</p>

      <div className="mt-6">
        <h3 className="text-2xl mb-3">Suratlar</h3>
        {venue.images && venue.images.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {venue.images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={`http://localhost:4001${imgUrl}`}
                alt={`To’yxona rasmi ${idx + 1}`}
                className="rounded shadow object-cover w-full h-48"
              />
            ))}
          </div>
        ) : (
          <p>Rasm mavjud emas</p>
        )}
      </div>
    </div>
  );
}

export default VenueDetails;
