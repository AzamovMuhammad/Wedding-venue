import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; 
import axios from "axios";

function BookingCalendar() {
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:4001/booking/booked-dates",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Javobi Ma'lumotlari:", res.data); 

        if (res.data && Array.isArray(res.data.bookedDates)) {
          const dates = res.data.bookedDates.map(
            (dateString) => new Date(dateString)
          );
          setBookedDates(dates);
        } else {
          console.warn(
            "Bron qilingan sanalar topilmadi yoki ma'lumotlar formati noto'g'ri:",
            res.data
          );
          setBookedDates([]);
        }
      } catch (error) {
        console.error("Bronlarni olishda xatolik:", error);
        if (error.response) {
          console.error("Xatolik javobi ma'lumotlari:", error.response.data);
          console.error("Xatolik javobi statusi:", error.response.status);
        }
        setBookedDates([]);
      }
    }

    fetchBookings();
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const found = bookedDates.find(
        (bookedDate) => bookedDate.toDateString() === date.toDateString()
      );
      if (found) return "bg-red-400 text-white rounded"; 
    }
    return null;
  };

  return (
    <div className="pt-27">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">Bron Kalendari</h1>
        <Calendar tileClassName={tileClassName} />
      </div>
    </div>
  );
}

export default BookingCalendar;
