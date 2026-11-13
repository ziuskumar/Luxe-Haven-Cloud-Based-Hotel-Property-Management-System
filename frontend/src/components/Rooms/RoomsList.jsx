import React, { useState, useEffect } from "react";
import API from "../../api";
import BookingModal from "./BookingModal";
import {
  Search,
  Filter,
  BedDouble,
  Users,
  CheckCircle,
  Wifi,
  Tv,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Standard",
  "Deluxe",
  "Executive Suite",
  "Presidential Suite",
  "Ocean Villa",
];

export default function RoomsList({ onBookingComplete }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(1500);

  const [bookingRoom, setBookingRoom] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (checkInDate && checkOutDate) {
        params.append("checkInDate", checkInDate);
        params.append("checkOutDate", checkOutDate);
      }
      if (search) params.append("search", search);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await API.get(`/rooms?${params.toString()}`);
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, checkInDate, checkOutDate, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
              Luxury Rooms & Real-Time Availability
              <span className="text-xs font-sans font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2.5 py-0.5 rounded-full">
                Live Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your travel dates to view real-time vacant rooms with double-booking prevention
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room title, number, or amenity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRooms()}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Date Filter & Price Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Check-In Date</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Check-Out Date</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span className="font-medium">Max Nightly Rate:</span>
              <span className="font-mono text-sky-400 font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer mt-1.5"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/30 rounded-3xl border border-slate-800 text-slate-400 text-sm">
          No rooms match the chosen availability dates or filters. Try adjusting your dates or price range.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const img =
              room.images && room.images.length > 0
                ? room.images[0].url
                : "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80";

            return (
              <div
                key={room._id}
                className="bg-slate-800/60 rounded-3xl border border-slate-700/80 overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-600 transition group"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={img}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-sky-400 text-xs font-bold font-mono">
                        Room #{room.roomNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-slate-200 text-xs font-semibold">
                        {room.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase backdrop-blur ${
                          room.housekeepingStatus === "clean" || room.housekeepingStatus === "inspected"
                            ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950/90 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {room.housekeepingStatus}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-white text-lg font-serif">{room.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {room.description || "Luxury suite with plush furnishings and modern amenities."}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700">
                        <Users className="w-3 h-3 text-sky-400" />
                        Up to {room.maxOccupancy?.adults || 2} Guests
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700">
                        <BedDouble className="w-3 h-3 text-sky-400" />
                        {room.bedType} Bed
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700">
                        <Layers className="w-3 h-3 text-sky-400" />
                        Floor {room.floor}
                      </span>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(room.amenities || []).slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Pricing & Action */}
                <div className="p-5 pt-0 border-t border-slate-700/50 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider">Base Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold font-mono text-white">${room.basePrice}</span>
                      <span className="text-xs text-slate-400">/ night</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingRoom(room)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center gap-1.5"
                  >
                    <span>Reserve Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          onClose={() => setBookingRoom(null)}
          onSuccess={(data) => {
            setBookingRoom(null);
            if (onBookingComplete) onBookingComplete(data);
          }}
        />
      )}
    </div>
  );
}
