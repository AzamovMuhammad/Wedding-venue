import React, { useState } from "react";
import axios from "axios";
import useVenueStore from "../zustand/store";
import { useNavigate } from "react-router-dom";

function UploadVenueImages() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate  = useNavigate()

  const token = localStorage.getItem("token");
  const venueId = useVenueStore((state) => state.venueId);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setError("Eng ko‘pi bilan 5 ta rasm yuklash mumkin.");
      setSelectedFiles([]);
      return;
    }

    setError("");
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (selectedFiles.length === 0) {
      setError("Iltimos, kamida bitta fayl tanlang");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await axios.post(
        `http://localhost:4001/venues/${venueId}/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message || "Rasmlar muvaffaqiyatli yuklandi!");
      setSelectedFiles([]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Surat yuklashda xatolik yuz berdi"
      );
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-pink-700 mb-4 text-center">
          To’yxona suratlarini yuklash
        </h3>

        {message && (
          <p className="text-green-600 mb-3 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 mb-3 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            multiple
            accept=".jpeg,.jpg,.png,.webp"
            onChange={handleFileChange}
            className="w-full file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-pink-100 file:text-pink-700
              hover:file:bg-pink-200"
          />

          <div className="flex gap-4">
            <button
              onClick={() => {
                navigate("/");
              }}
              className="w-full bg-white border border-pink-700 hover:bg-pink-700 text-pink-700 hover:text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer">
              Bekor qilish
            </button>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition duration-300">
              Yuklash
            </button>
          </div>
        </form>

        {/* ✅ All image previews */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-pink-600 mb-2">
              Tanlangan rasmlar:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden border border-pink-200 shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`uploaded-${index}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadVenueImages;
