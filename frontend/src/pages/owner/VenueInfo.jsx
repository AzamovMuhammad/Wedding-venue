import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate ni import qilamiz

function VenueInfo() {
  const { id } = useParams(); // URL parametridan venue id olish
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Bron qilish uchun state'lar
  const [reservationDate, setReservationDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchVenue() {
      if (!id || !token) {
        setError("To'yxona ID si yoki token mavjud emas.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:4001/venue/${id}`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setVenue(res.data.venue);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "To'yxona ma'lumotlarini yuklashda xatolik yuz berdi"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchVenue();
  }, [id, token]);
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage("");
    setBookingError("");
    setIsBooking(true);

    if (!reservationDate || !guestCount) {
      setBookingError("Iltimos, bron sanasi va mehmonlar sonini kiriting.");
      setIsBooking(false);
      return;
    }

    try {
      const bookingPayload = {
        venue_id: parseInt(id), 
        reservation_date: reservationDate,
        guest_count: parseInt(guestCount),
      };

      const res = await axios.post(
        "http://localhost:4001/users/bron",
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setBookingMessage("To'yxona muvaffaqiyatli bron qilindi!");
      console.log("Bron natijasi:", res.data.booking);
      setReservationDate("");
      setGuestCount("");

    } catch (err) {
      console.error("Bron qilishda xatolik:", err);
      setBookingError(
        err.response?.data?.message || "Bron qilishda server xatosi yuz berdi."
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!venue) return <p className="text-center mt-10">To’yxona topilmadi</p>;

  return (
    <div className="pt-27">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-10">
        <h2 className="text-3xl font-bold mb-6 text-pink-700">{venue.name}</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="mb-2">
              <strong>Rayon:</strong> {venue.district_name || "Noma'lum"}
            </p>
            <p className="mb-2">
              <strong>Manzil:</strong> {venue.address}
            </p>
            <p className="mb-2">
              <strong>Sig‘im:</strong> {venue.capacity} kishi
            </p>
            <p className="mb-2">
              <strong>Narx (1 o‘rindiq):</strong>{" "}
              {venue.price_per_seat
                ? `${venue.price_per_seat.toLocaleString()} so‘m`
                : "Noma'lum"}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Telefon:</strong> {venue.phone_number || "Ko‘rsatilmagan"}
            </p>
            <p className="mb-2">
              <strong>Egasi:</strong> {venue.owner_firstname || ""}{" "}
              {venue.owner_lastname || "Noma'lum"}
            </p>
            <p className="mb-2">
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  venue.status === "tasdiqlangan"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                {venue.status || "Noma'lum"}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Suratlar
          </h3>
          {venue.images && venue.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {venue.images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={
                    imgUrl.startsWith("http")
                      ? imgUrl
                      : `http://localhost:4001${imgUrl}`
                  } // Agar URL to'liq bo'lmasa, localhost qo'shish
                  alt={`To’yxona rasmi ${idx + 1}`}
                  className="rounded-lg shadow-md object-cover w-full h-56 hover:shadow-xl transition-shadow duration-300"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Bu to'yxona uchun rasm mavjud emas.</p>
          )}
        </div>

        {/* --- Bron Qilish Formasi --- */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-semibold mb-5 text-gray-800">
            To'yxonani Bron Qilish
          </h3>
          {bookingMessage && (
            <p className="text-green-600 mb-3 p-3 bg-green-50 rounded-md">
              {bookingMessage}
            </p>
          )}
          {bookingError && (
            <p className="text-red-600 mb-3 p-3 bg-red-50 rounded-md">
              {bookingError}
            </p>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reservationDate"
                className="block text-sm font-medium text-gray-700 mb-1">
                Bron Sanasi:
              </label>
              <input
                type="date"
                id="reservationDate"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                min={new Date().toISOString().split("T")[0]} // Joriy sanadan oldingi sanalarni bloklash
              />
            </div>
            <div>
              <label
                htmlFor="guestCount"
                className="block text-sm font-medium text-gray-700 mb-1">
                Mehmonlar Soni:
              </label>
              <input
                type="number"
                id="guestCount"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
                min="1"
                max={venue.capacity} // Maksimal sig'imdan oshmasligi kerak
                placeholder={`Maksimal ${venue.capacity} kishi`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isBooking}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-60">
              {isBooking ? "Bron qilinmoqda..." : "Bron Qilish"}
            </button>
          </form>
        </div>
        {/* --- Bron Qilish Formasi Tugadi --- */}
      </div>
    </div>
  );
}

export default VenueInfo;
