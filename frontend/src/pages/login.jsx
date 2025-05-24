import axios from "axios";
import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4001/auth/login", { username, password });
      alert("Login successful! Token: " + response.data.token);
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
          <svg
            className="w-10 h-10 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3a1 1 0 01.993.883L11 4v2a1 1 0 01-1.993.117L9 6V4a1 1 0 011-1zM4.293 6.293a1 1 0 011.414 0L7 7.586 8.293 6.293a1 1 0 011.32-.083l.094.083 3 3a1 1 0 01-1.32 1.497l-.094-.083L9 8.414 7.707 9.707a1 1 0 01-1.32.083l-.094-.083-2-2a1 1 0 010-1.414z" />
          </svg>
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
          Not a member? <a href="/register" className="text-indigo-400 hover:underline">Start a 14 day free trial</a>
        </p>
      </div>
    </div>
  );
}
