import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Corusel from "../../components/corusel";

function VenuesCards() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter va sort uchun state
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc / desc
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("tasdiqlangan"); // faqat tasdiqlangan

  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");

        // 1. To'yxonalar (faqat tasdiqlanganlar) olish
        const venuesRes = await axios.get("http://localhost:4001/venue/", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "tasdiqlangan" }, // backendda status filter qilish
        });

        setVenues(venuesRes.data.venues);
        setLoading(false);

        // 2. Rayonlar ro'yxatini olish (filter uchun)
        const districtsRes = await axios.get("http://localhost:4001/districts");
        setDistricts(districtsRes.data.districts || []);
      } catch (err) {
        setError("To‘yxonalar ma’lumotlarini olishda xatolik yuz berdi.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter, search va sortni birlashtirib filteredVenues ni yangilash
  useEffect(() => {
    let tempVenues = [...venues];

    // Qidiruv (name bo'yicha, katta-kichik harf farqi yo'q)
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      tempVenues = tempVenues.filter((v) =>
        v.name.toLowerCase().includes(lowerSearch)
      );
    }

    // Rayon bo'yicha filter
    if (filterDistrict !== "") {
      tempVenues = tempVenues.filter(
        (v) => String(v.district_id) === filterDistrict
      );
    }

    // Status bo'yicha filter (default faqat tasdiqlangan)
    if (filterStatus !== "") {
      tempVenues = tempVenues.filter((v) => v.status === filterStatus);
    }

    // Tartiblash
    if (sortField !== "") {
      tempVenues.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // District_name string, boshqa maydonlar number
        if (sortField === "district_name") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        } else {
          // Number uchun sort
          if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
          return 0;
        }
      });
    }

    setFilteredVenues(tempVenues);
  }, [venues, searchTerm, filterDistrict, filterStatus, sortField, sortOrder]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex gap-4 flex-col  w-full">
      <Corusel />

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className="flex flex-col items-center justify-center gap-4 p-8 ">
        <h1 className="text-5xl text-pink-400">To’yxonalar</h1>

        {/* Filterlar va qidiruv */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />

          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Barcha rayonlar</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="tasdiqlangan">Tasdiqlangan</option>
            <option value="tasdiqlanmagan">Tasdiqlanmagan</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Tartiblash</option>
            <option value="price_per_seat">Narx</option>
            <option value="capacity">Sig‘im</option>
            <option value="district_name">Rayon</option>
            <option value="status">Status</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="asc">O‘sish tartibida</option>
            <option value="desc">Kamayish tartibida</option>
          </select>
        </div>

        {/* To'yxona kartalari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredVenues.length > 0 ? (
            filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white border border-pink-100 rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
              >
                <img
                  src={`http://localhost:4001${venue.images?.[0] || "/default.png"}`}
                  className="w-full"
                  alt={venue.name}
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
                  <strong>Narx:</strong> {venue.price_per_seat} so‘m (1 o‘rindiq)
                </p>
                <p className="text-pink-800">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      venue.status === "tasdiqlangan"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {venue.status}
                  </span>
                </p>

                <button
                  onClick={() => navigate(`/details/${venue.id}`)}
                  className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  To‘yxonani ko‘rish
                </button>
                <button
                  onClick={() => navigate(`/update/${venue.id}`)}
                  className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Edit to'yxona
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
