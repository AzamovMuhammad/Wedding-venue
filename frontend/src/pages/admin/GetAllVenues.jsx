import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

// Helper function for debounce (optional, but good for performance on search)
function debounce(func, delay) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}

function GetAllVenues() {
  const [allVenues, setAllVenues] = useState([]); // Original list from API
  const [displayedVenues, setDisplayedVenues] = useState([]); // List to render after filters/sort
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // --- State for Filters, Sort, Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' }); // direction: 'ascending', 'descending', 'none'

  const token = localStorage.getItem("token");

  const uniqueDistricts = useMemo(() => {
    if (!allVenues.length) return [];
    const districts = [...new Set(allVenues.map(v => v.district_name).filter(Boolean))].sort();
    return districts;
  }, [allVenues]);

  const statusOptions = [
    { value: "", label: "Barcha Statuslar" },
    { value: "tasdiqlangan", label: "Tasdiqlangan" },
    { value: "tasdiqlanmagan", label: "Tasdiqlanmagan" },
    { value: "pending", label: "Kutilmoqda" },
  ];

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionMessage("");
    try {
      const res = await axios.get("http://localhost:4001/venue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllVenues(res.data.venues || []);
    } catch (err) {
      setError(err.response?.data?.message || "To'yxonalarni yuklashda xatolik yuz berdi");
      setAllVenues([]); // Ensure allVenues is an empty array on error
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // --- Processing Logic for Filters, Sort, Search ---
  useEffect(() => {
    let processed = [...allVenues];

    // 1. Search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processed = processed.filter(venue =>
        Object.values(venue).some(val =>
          String(val).toLowerCase().includes(lowerSearchTerm)
        ) ||
        venue.name.toLowerCase().includes(lowerSearchTerm) ||
        (venue.district_name && venue.district_name.toLowerCase().includes(lowerSearchTerm)) ||
        (venue.address && venue.address.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // 2. Filter by District
    if (filterDistrict) {
      processed = processed.filter(venue => venue.district_name === filterDistrict);
    }

    // 3. Filter by Status
    if (filterStatus) {
      processed = processed.filter(venue => venue.status === filterStatus);
    }

    // 4. Sort
    if (sortConfig.key && sortConfig.direction !== 'none') {
      processed.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'price_per_seat' || sortConfig.key === 'capacity') {
          valA = parseFloat(valA) || 0; // Default to 0 if parsing fails
          valB = parseFloat(valB) || 0;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        // For other types, direct comparison

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    setDisplayedVenues(processed);
  }, [allVenues, searchTerm, filterDistrict, filterStatus, sortConfig]);


  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm("Haqiqatan ham bu to'yxonani o'chirmoqchimisiz?")) return;
    
    setError(""); 
    setActionMessage("");
    try {
      const res = await axios.delete(`http://localhost:4001/venue/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllVenues(prev => prev.filter(v => v.id !== venueId)); // Update original list
      setActionMessage(res.data.message || "To’yxona muvaffaqiyatli o‘chirildi");
    } catch (err) {
      setError(err.response?.data?.message || "O‘chirishda xatolik yuz berdi");
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'none'; // Third click resets sort for this key
    }
    // If it's a new key or direction is 'none', set to ascending
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') return ' ▲';
      if (sortConfig.direction === 'descending') return ' ▼';
    }
    return '';
  };
  
  const debouncedSearch = useCallback(debounce((value) => setSearchTerm(value), 300), []);


  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Barcha To’yxonalar</h1>

      {/* --- Filter and Search Controls --- */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg shadow">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Qidiruv</label>
          <input
            type="text"
            id="search"
            placeholder="Nomi, manzili bo'yicha..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            onChange={(e) => debouncedSearch(e.target.value)} // Using debounced search
          />
        </div>
        <div>
          <label htmlFor="filterDistrict" className="block text-sm font-medium text-gray-700 mb-1">Rayon</label>
          <select
            id="filterDistrict"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-white"
          >
            <option value="">Barcha Rayonlar</option>
            {uniqueDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
            <button 
                onClick={() => {
                    setSearchTerm("");
                    setFilterDistrict("");
                    setFilterStatus("");
                    setSortConfig({ key: null, direction: 'none' });
                    // Manually clear input field if not controlled directly by searchTerm for debounced version
                    const searchInput = document.getElementById('search');
                    if (searchInput) searchInput.value = "";
                }}
                className="w-full px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 sm:text-sm"
            >
                Filterlarni Tozalash
            </button>
        </div>
      </div>
      
      {/* --- Action Messages & Errors --- */}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      {actionMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{actionMessage}</p>}

      {/* --- Venues Table --- */}
      {displayedVenues.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-10">
            {searchTerm || filterDistrict || filterStatus ? "Filterlarga mos to'yxona topilmadi." : "Hech qanday to’yxona topilmadi."}
        </p>
      )}

      {displayedVenues.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full table-auto border-collapse border">
            <thead className="bg-pink-600 text-white">
              <tr>
                <th className="border-b border-pink-700 px-3 py-3 text-left text-sm font-semibold">Rasm</th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-pink-700" onClick={() => requestSort('name')}>
                  Nomi{getSortIndicator('name')}
                </th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-pink-700" onClick={() => requestSort('district_name')}>
                  Rayon{getSortIndicator('district_name')}
                </th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Manzil</th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-pink-700" onClick={() => requestSort('capacity')}>
                  Sig‘im{getSortIndicator('capacity')}
                </th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold hidden lg:table-cell cursor-pointer hover:bg-pink-700" onClick={() => requestSort('price_per_seat')}>
                  Narx (so‘m){getSortIndicator('price_per_seat')}
                </th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Telefon</th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-pink-700" onClick={() => requestSort('status')}>
                  Status{getSortIndicator('status')}
                </th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold hidden lg:table-cell">Egasi</th>
                <th className="border-b border-pink-700 px-4 py-3 text-left text-sm font-semibold">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedVenues.map((venue) => {
                const firstImage = venue.images && venue.images.length > 0 ? venue.images[0] : null;
                return (
                  <tr key={venue.id} className="hover:bg-pink-50 transition-colors duration-150">
                    <td className="border-b px-3 py-3 text-center">
                      {firstImage ? (
                        <>
                          <img
                            src={`http://localhost:4001${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`}
                            alt={`${venue.name} rasmi`}
                            className="w-20 h-16 object-cover rounded shadow"
                            onError={(e) => { 
                              e.target.style.display='none'; 
                              if (e.target.nextSibling && e.target.nextSibling.style) {
                                e.target.nextSibling.style.display='inline'; 
                              }
                            }}
                          />
                          <span className="text-gray-400 text-xs" style={{ display: 'none' }}>Rasm xatosi</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Rasm yo‘q</span>
                      )}
                    </td>
                    <td className="border-b px-4 py-3 text-sm text-gray-700 font-medium">{venue.name}</td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600">{venue.district_name}</td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{venue.address}</td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600 text-center">{venue.capacity}</td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600 hidden lg:table-cell text-right">{venue.price_per_seat}</td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{venue.phone_number || "Noma’lum"}</td>
                    <td className="border-b px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        venue.status === 'tasdiqlangan' ? 'bg-green-100 text-green-700' :
                        venue.status === 'tasdiqlanmagan' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {venue.status}
                      </span>
                    </td>
                    <td className="border-b px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {venue.owner_firstname} {venue.owner_lastname}
                    </td>
                    <td className="border-b px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteVenue(venue.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded text-xs shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                        title="O'chirish"
                      >
                        O‘chirish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GetAllVenues;