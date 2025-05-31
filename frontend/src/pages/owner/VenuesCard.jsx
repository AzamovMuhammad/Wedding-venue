import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Corusel from "../../components/corusel";

function VenuesCards() {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchVenues() {
      try {
        const token = localStorage.getItem("token"); // Tokenni localStorage dan olish
        const res = await axios.get("http://localhost:4001/venue/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVenues(res.data.venues); // Venuesni state ga saqlash
        setLoading(false);
      } catch (err) {
        setError("To‘yxonalar ma’lumotlarini olishda xatolik yuz berdi.");
        setLoading(false);
      }
    }

    fetchVenues();
  }, []);

  console.log(venues);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex gap-4 flex-col  w-full">
      <Corusel />

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <div className="flex flex-col items-center justify-center gap-4 p-8 ">
        <h1 className="text-5xl text-pink-400">Venues</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {venues.length > 0 ? (
            venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white border border-pink-100 rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300">
                <img
                  src={`http://localhost:4001${venue.images[0]}`}
                  className="w-full"
                  alt=""
                />
                <h3 className="text-xl font-semibold text-pink-600 mb-2">
                  {venue.name}
                </h3>
                <p className="text-pink-800">
                  <strong>Rayon:</strong> {venue.district_name}
                </p>
                <p className="text-pink-800">
                  <strong>Sig‘im:</strong> {venue.capacity} o‘rindiq
                </p>
                <p className="text-pink-800">
                  <strong>Narx:</strong> {venue.price_per_seat} so‘m (1
                  o‘rindiq)
                </p>
                <p className="text-pink-800">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      venue.status === "available"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                    {venue.status}
                  </span>
                </p>

                <button
                  onClick={() => {
                    navigate(`/details/${venue.id}`);
                  }}
                  className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                  To‘yxonani ko‘rish
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-pink-600 text-lg">
              Hozirda to‘yxonalar mavjud emas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VenuesCards;
