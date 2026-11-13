import React, { useState, useEffect } from "react";
import API from "../../api";
import BookingModal from "./BookingModal";
import {
  Search,
  BedDouble,
  Users,
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
      {/* Header & Filter Bar - Plaster White (#ffffff) */}
      <div className="card-plaster space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-midnight-ink flex items-center gap-2">
              Luxury Rooms & Real-Time Availability
              <span className="text-[11px] font-bold bg-voltage-lime text-midnight-ink px-3 py-0.5 rounded-full">
                Live Engine
              </span>
            </h1>
            <p className="text-xs text-slate-mute mt-1 font-medium">
              Filter by dates to verify real-time vacancies with double-booking prevention
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-mute" />
            <input
              type="text"
              placeholder="Search room title or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRooms()}
              className="w-full bg-bone-canvas border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-midnight-ink placeholder-slate-mute focus:outline-none focus:border-midnight-ink"
            />
          </div>
        </div>

        {/* Date Filter & Price Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-midnight-ink mb-1 font-bold">Check-In Date</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2 text-midnight-ink font-semibold focus:outline-none focus:border-midnight-ink"
            />
          </div>

          <div>
            <label className="block text-midnight-ink mb-1 font-bold">Check-Out Date</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2 text-midnight-ink font-semibold focus:outline-none focus:border-midnight-ink"
            />
          </div>

          <div>
            <div className="flex justify-between text-midnight-ink mb-1">
              <span className="font-bold">Max Rate:</span>
              <span className="font-mono text-midnight-ink font-black">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-midnight-ink cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-midnight-ink text-plaster-white"
                  : "bg-bone-canvas text-midnight-ink hover:bg-slate-200"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-ink"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card-plaster p-12 text-center text-slate-mute text-xs">
          No rooms match the chosen dates or filters. Try adjusting your dates.
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
                className="card-plaster flex flex-col justify-between overflow-hidden p-0 border border-slate-200 hover:border-slate-400 transition group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-56 w-full overflow-hidden rounded-t-[30px]">
                    <img
                      src={img}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-midnight-ink text-voltage-lime text-xs font-black font-mono">
                        #{room.roomNumber}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-plaster-white/95 backdrop-blur text-midnight-ink text-xs font-extrabold">
                        {room.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          room.housekeepingStatus === "clean" || room.housekeepingStatus === "inspected"
                            ? "bg-voltage-lime text-midnight-ink"
                            : "bg-saffron text-midnight-ink"
                        }`}
                      >
                        {room.housekeepingStatus}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-extrabold text-midnight-ink text-xl tracking-tight">{room.title}</h3>
                    <p className="text-xs text-slate-mute line-clamp-2 leading-relaxed">
                      {room.description || "Luxury suite with plush furnishings and modern amenities."}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-midnight-ink font-bold pt-1">
                      <span className="flex items-center gap-1 bg-bone-canvas px-3 py-1 rounded-full">
                        <Users className="w-3 h-3 text-slate-mute" />
                        Up to {room.maxOccupancy?.adults || 2} Guests
                      </span>
                      <span className="flex items-center gap-1 bg-bone-canvas px-3 py-1 rounded-full">
                        <BedDouble className="w-3 h-3 text-slate-mute" />
                        {room.bedType} Bed
                      </span>
                      <span className="flex items-center gap-1 bg-bone-canvas px-3 py-1 rounded-full">
                        <Layers className="w-3 h-3 text-slate-mute" />
                        Floor {room.floor}
                      </span>
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(room.amenities || []).slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] text-slate-mute bg-bone-canvas px-2.5 py-0.5 rounded-full font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-mute tracking-wider">Base Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black font-mono text-midnight-ink">${room.basePrice}</span>
                      <span className="text-xs text-slate-mute font-semibold">/ nt</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingRoom(room)}
                    className="btn-lime text-xs px-5 py-2.5"
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
