import axios from "axios";
import React, { useState } from "react";
import logo from "../assets/logo/logo.png"
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4001/auth/login", { username, password });
      alert("Login successful!");
      localStorage.setItem("token", response.data.token)
      navigate('/')
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      }
      else {
        alert("Server bilan bog‘lanishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center">
          <img  className="w-40 h-40 text-indigo-500" src={logo} alt="logo" />
        </div>
        <h2 className="text-center text-2xl font-bold text-white">
          Sign in to your account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors duration-300 cursor-pointer"
          >
            Sign in
          </button>
        </form>
        <p className="text-sm text-center text-white">
          Not a member? <a href="/register" className="text-indigo-400 hover:underline">go to Register.</a>
        </p>
      </div>
    </div>
  );
}
