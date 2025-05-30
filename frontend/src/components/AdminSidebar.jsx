import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "addVenue", path: "/admin/addVenue" },
    { name: "getVenueOwners", path: "/admin/getVenueOwners" },
    { name: "getBrons", path: "/admin/getBrons" },
    { name: "getVenues", path: "/admin/getVenues" },
    { name: "confirm", path: "/admin/confirm" },
  ];

  return (
    <>
      <div className="bg-pink-600 text-white flex items-center justify-between p-4 md:hidden">
        <div className="text-lg font-bold">Admin Panel</div>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="focus:outline-none"
        >
          {/* Hamburger icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              // Close icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-pink-700 text-white
          transform transition-transform duration-300 ease-in-out
          z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex md:flex-col
        `}
      >
        <div className="p-6 font-bold text-xl border-b border-pink-600">
          Admin Panel
        </div>
        <nav className="flex flex-col p-4 space-y-2 flex-grow">
          {menuItems.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className={`block px-4 py-2 rounded hover:bg-pink-600 transition
                ${
                  location.pathname === path
                    ? "bg-pink-900 font-semibold"
                    : ""
                }
              `}
              onClick={() => setIsOpen(false)}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-pink-600 text-sm">
          © 2025 Your Company
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default AdminSidebar;
