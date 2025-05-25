import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    role: "user", // default role
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  const roles = ["user", "owner"];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4001/auth/register",
        formData
      );
      alert(res.data.message);
      setFormData({
        firstname: "",
        lastname: "",
        username: "",
        password: "",
        role: "user",
        phone_number: "",
      });
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server bilan bog‘lanishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-2xl shadow-xl border border-pink-100">
        <h2 className="text-center text-2xl font-semibold text-pink-700">
          Create Your Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-pink-700">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-700">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition duration-300 disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-pink-600">
          Already have an account?
          <a href="/login" className="ml-1 text-pink-500 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
