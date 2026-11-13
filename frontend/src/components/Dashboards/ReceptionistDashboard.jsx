import React, { useState, useEffect } from "react";
import API from "../../api";
import {
  LogIn,
  LogOut,
  BedDouble,
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Search,
  RefreshCw,
} from "lucide-react";

export default function ReceptionistDashboard({ onRefreshCalendar }) {
  const [schedule, setSchedule] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInModal, setCheckInModal] = useState({ open: false, booking: null, keyNumber: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, roomsRes] = await Promise.all([
        API.get("/calendar/daily"),
        API.get("/rooms"),
      ]);
      setSchedule(schedRes.data);
      setRooms(roomsRes.data.rooms || []);
    } catch (err) {
      console.error("Failed to load front desk data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await API.patch(`/rooms/${roomId}/housekeeping`, { housekeepingStatus: newStatus });
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, housekeepingStatus: newStatus } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update housekeeping status");
    }
  };

  const executeCheckIn = async () => {
    if (!checkInModal.booking) return;
    try {
      await API.post(`/bookings/${checkInModal.booking._id}/check-in`, {
        roomKeyNumber: checkInModal.keyNumber || `KEY-${checkInModal.booking.room?.roomNumber}`,
      });
      setCheckInModal({ open: false, booking: null, keyNumber: "" });
      fetchData();
      if (onRefreshCalendar) onRefreshCalendar();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const executeCheckOut = async (bookingId) => {
    if (!window.confirm("Confirm guest check-out? Room will be flagged Dirty for housekeeping.")) return;
    try {
      await API.post(`/bookings/${bookingId}/check-out`);
      fetchData();
      if (onRefreshCalendar) onRefreshCalendar();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  const getHousekeepingBadge = (status) => {
    switch (status) {
      case "clean":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case "inspected":
        return "bg-sky-950 text-sky-300 border-sky-800";
      case "dirty":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "maintenance":
        return "bg-red-950 text-red-300 border-red-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const arrivals = schedule?.arrivals || [];
  const departures = schedule?.departures || [];

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Front Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            Front Desk & Housekeeping Operations
            <span className="text-xs font-sans font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
              Live Room Rack
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage daily guest arrivals, room key assignments, check-outs, and room sanitation states
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Daily KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 rounded-xl border border-emerald-800/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Today's Arrivals</span>
            <div className="text-2xl font-bold text-white mt-1">{schedule?.arrivalsCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Guests checking in today</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 p-4 rounded-xl border border-amber-800/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Today's Departures</span>
            <div className="text-2xl font-bold text-white mt-1">{schedule?.departuresCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled check-outs</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <LogOut className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-950/40 to-slate-900 p-4 rounded-xl border border-sky-800/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">In-House Guests</span>
            <div className="text-2xl font-bold text-white mt-1">{schedule?.inHouseCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Currently staying</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Arrivals & Departures Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals Table */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-400" />
              Incoming Arrivals (Check-in Ready)
            </h3>
            <span className="text-xs text-slate-400">{arrivals.length} reservations</span>
          </div>

          {arrivals.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No pending arrivals for today.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {arrivals.map((b) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Room {b.room?.roomNumber}</span>
                      <span className="text-slate-400">({b.room?.category})</span>
                    </div>
                    <p className="text-slate-300 font-medium mt-0.5">{b.guestDetails?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Ref: {b.bookingNumber} &bull; {b.nights} night(s) &bull; Paid: ${b.paidAmount}
                    </p>
                  </div>

                  <div>
                    {b.status === "checked_in" ? (
                      <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold text-[11px]">
                        Checked In
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          setCheckInModal({
                            open: true,
                            booking: b,
                            keyNumber: `KEY-${b.room?.roomNumber}`,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Check-In</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Departures Table */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <LogOut className="w-4 h-4 text-amber-400" />
              Scheduled Departures (Check-out)
            </h3>
            <span className="text-xs text-slate-400">{departures.length} reservations</span>
          </div>

          {departures.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No pending departures for today.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {departures.map((b) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Room {b.room?.roomNumber}</span>
                      <span className="text-slate-400">({b.room?.category})</span>
                    </div>
                    <p className="text-slate-300 font-medium mt-0.5">{b.guestDetails?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Key issued: {b.roomKeyNumber || "None"} &bull; Total: ${b.pricing?.totalAmount}
                    </p>
                  </div>

                  <div>
                    {b.status === "checked_out" ? (
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-semibold text-[11px]">
                        Checked Out
                      </span>
                    ) : (
                      <button
                        onClick={() => executeCheckOut(b._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Check-Out</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Rack & Housekeeping Grid */}
      <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-sky-400" />
              Room Rack & Housekeeping Status
            </h3>
            <p className="text-xs text-slate-400">
              Real-time room occupancy, status, and 1-click housekeeping state updates
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search room number or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === "occupied";
            const hkBadge = getHousekeepingBadge(room.housekeepingStatus);

            return (
              <div
                key={room._id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                  isOccupied
                    ? "bg-slate-900/90 border-sky-800/60 shadow-sm"
                    : "bg-slate-900/50 border-slate-700/60 hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">#{room.roomNumber}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOccupied ? "bg-sky-400 animate-pulse" : "bg-emerald-400"
                      }`}
                      title={isOccupied ? "Occupied" : "Available"}
                    ></span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{room.category}</p>
                  <p className="text-[11px] text-slate-500">Floor {room.floor} &bull; ${room.basePrice}/nt</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1">Housekeeping:</div>
                  <select
                    value={room.housekeepingStatus}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    className={`w-full text-[11px] font-semibold py-1 px-1.5 rounded border ${hkBadge} focus:outline-none cursor-pointer`}
                  >
                    <option value="clean" className="bg-slate-900 text-emerald-400">Clean</option>
                    <option value="inspected" className="bg-slate-900 text-sky-400">Inspected</option>
                    <option value="dirty" className="bg-slate-900 text-amber-400">Dirty</option>
                    <option value="maintenance" className="bg-slate-900 text-red-400">Maintenance</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Check-In Key Issuance Modal */}
      {checkInModal.open && checkInModal.booking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                Issue Room Key & Complete Check-In
              </h3>
              <button
                onClick={() => setCheckInModal({ open: false, booking: null, keyNumber: "" })}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <p>
                  <strong>Guest Name:</strong> {checkInModal.booking.guestDetails?.name}
                </p>
                <p>
                  <strong>Room Assigned:</strong> #{checkInModal.booking.room?.roomNumber} (
                  {checkInModal.booking.room?.category})
                </p>
                <p>
                  <strong>Booking Ref:</strong> {checkInModal.booking.bookingNumber}
                </p>
                <p>
                  <strong>Duration:</strong> {checkInModal.booking.nights} night(s)
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Physical Key / Smart Card Tag Number:
                </label>
                <input
                  type="text"
                  value={checkInModal.keyNumber}
                  onChange={(e) =>
                    setCheckInModal({ ...checkInModal, keyNumber: e.target.value })
                  }
                  placeholder={`KEY-${checkInModal.booking.room?.roomNumber}`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCheckInModal({ open: false, booking: null, keyNumber: "" })}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeCheckIn}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Confirm & Check In Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
