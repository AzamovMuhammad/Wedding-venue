import axios from "axios";
import React, { useState, useEffect } from "react";
import logo from "../assets/logo/logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Tokenni va user rolini saqlash uchun
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Token o‘zgarganda user ma’lumotlarini olish va yo‘naltirish
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:4001/profile/info", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const role = res.data.role;
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4001/auth/login", {
        username,
        password,
      });
      alert("Login successful!");
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token); // useEffect ishga tushishi uchun
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
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-pink-100">
        <div className="flex justify-center">
          <img
            className="w-54 h-48"
            src={logo}
            alt="logo"
          />
        </div>
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-pink-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="e.g. eshmat_boy"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition duration-300"
          >
            {loading ? "Kuting..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center text-pink-600">
          Not a member?
          <a href="/register" className="ml-1 text-pink-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
