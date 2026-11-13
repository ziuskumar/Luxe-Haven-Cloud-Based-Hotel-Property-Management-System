import React, { useState, useEffect } from "react";
import API from "../../api";
import {
  LogIn,
  LogOut,
  BedDouble,
  Key,
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

  const getHousekeepingStyle = (status) => {
    switch (status) {
      case "clean":
        return "bg-voltage-lime text-midnight-ink border-black/20";
      case "inspected":
        return "bg-cobalt-signal text-plaster-white border-cobalt-signal";
      case "dirty":
        return "bg-saffron text-midnight-ink border-black/20";
      case "maintenance":
        return "bg-bordeaux-maroon text-plaster-white border-bordeaux-maroon";
      default:
        return "bg-slate-200 text-midnight-ink border-slate-300";
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
      {/* Front Desk Header - Full Bleed Forest Depth Band */}
      <div className="bg-forest-depth text-plaster-white rounded-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-voltage-lime mb-2">
            Front Desk & Housekeeping Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Guest Reception & <span className="text-voltage-lime">Room Rack</span>
          </h1>
          <p className="text-xs sm:text-sm text-plaster-white/90 mt-2 font-medium">
            Manage daily check-ins, issue electronic room key cards, and monitor housekeeping sanitation.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="btn-lime text-xs px-5 py-2.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Rack</span>
        </button>
      </div>

      {/* Daily KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-plaster flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-mute uppercase tracking-wider">Today's Arrivals</span>
            <div className="text-3xl font-black text-midnight-ink mt-1">{schedule?.arrivalsCount || 0}</div>
            <p className="text-[11px] text-slate-mute mt-0.5">Guests checking in today</p>
          </div>
          <div className="p-3 rounded-full bg-voltage-lime text-midnight-ink">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        <div className="card-plaster flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-mute uppercase tracking-wider">Today's Departures</span>
            <div className="text-3xl font-black text-midnight-ink mt-1">{schedule?.departuresCount || 0}</div>
            <p className="text-[11px] text-slate-mute mt-0.5">Scheduled check-outs</p>
          </div>
          <div className="p-3 rounded-full bg-bordeaux-maroon text-plaster-white">
            <LogOut className="w-6 h-6" />
          </div>
        </div>

        <div className="card-plaster flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-mute uppercase tracking-wider">In-House Guests</span>
            <div className="text-3xl font-black text-midnight-ink mt-1">{schedule?.inHouseCount || 0}</div>
            <p className="text-[11px] text-slate-mute mt-0.5">Currently staying</p>
          </div>
          <div className="p-3 rounded-full bg-cobalt-signal text-plaster-white">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Arrivals & Departures Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="card-plaster">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2">
              <LogIn className="w-4 h-4 text-forest-depth" />
              Incoming Arrivals (Check-In Ready)
            </h3>
            <span className="text-xs font-bold bg-bone-canvas text-midnight-ink px-2.5 py-1 rounded-full">
              {arrivals.length} reservations
            </span>
          </div>

          {arrivals.length === 0 ? (
            <div className="p-8 text-center text-slate-mute text-xs">
              No pending arrivals for today.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {arrivals.map((b) => (
                <div
                  key={b._id}
                  className="p-3.5 rounded-2xl bg-bone-canvas border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-midnight-ink text-sm">Room #{b.room?.roomNumber}</span>
                      <span className="text-slate-mute font-semibold">({b.room?.category})</span>
                    </div>
                    <p className="text-midnight-ink font-bold mt-0.5">{b.guestDetails?.name}</p>
                    <p className="text-[11px] text-slate-mute">
                      Ref: {b.bookingNumber} &bull; {b.nights} night(s) &bull; Paid: ${b.paidAmount}
                    </p>
                  </div>

                  <div>
                    {b.status === "checked_in" ? (
                      <span className="px-3 py-1 rounded-full bg-midnight-ink text-voltage-lime font-bold text-[11px]">
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
                        className="btn-lime text-xs px-3.5 py-1.5"
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

        {/* Today's Departures */}
        <div className="card-plaster">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2">
              <LogOut className="w-4 h-4 text-bordeaux-maroon" />
              Scheduled Departures (Check-Out)
            </h3>
            <span className="text-xs font-bold bg-bone-canvas text-midnight-ink px-2.5 py-1 rounded-full">
              {departures.length} reservations
            </span>
          </div>

          {departures.length === 0 ? (
            <div className="p-8 text-center text-slate-mute text-xs">
              No pending departures for today.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {departures.map((b) => (
                <div
                  key={b._id}
                  className="p-3.5 rounded-2xl bg-bone-canvas border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-midnight-ink text-sm">Room #{b.room?.roomNumber}</span>
                      <span className="text-slate-mute font-semibold">({b.room?.category})</span>
                    </div>
                    <p className="text-midnight-ink font-bold mt-0.5">{b.guestDetails?.name}</p>
                    <p className="text-[11px] text-slate-mute">
                      Key issued: {b.roomKeyNumber || "None"} &bull; Total: ${b.pricing?.totalAmount}
                    </p>
                  </div>

                  <div>
                    {b.status === "checked_out" ? (
                      <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-mute font-bold text-[11px]">
                        Checked Out
                      </span>
                    ) : (
                      <button
                        onClick={() => executeCheckOut(b._id)}
                        className="btn-black text-xs px-3.5 py-1.5"
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
      <div className="card-plaster">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-extrabold text-midnight-ink text-lg tracking-tight flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-midnight-ink" />
              Room Rack & Housekeeping Status
            </h3>
            <p className="text-xs text-slate-mute">
              Real-time room occupancy, status indicators, and 1-click sanitation updates
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-mute" />
            <input
              type="text"
              placeholder="Search room # or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bone-canvas border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-midnight-ink placeholder-slate-mute focus:outline-none focus:border-midnight-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === "occupied";
            const hkStyle = getHousekeepingStyle(room.housekeepingStatus);

            return (
              <div
                key={room._id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                  isOccupied
                    ? "bg-cobalt-signal/5 border-cobalt-signal"
                    : "bg-bone-canvas border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-midnight-ink text-base">#{room.roomNumber}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? "bg-cobalt-signal animate-pulse" : "bg-forest-depth"
                      }`}
                      title={isOccupied ? "Occupied" : "Available"}
                    ></span>
                  </div>
                  <p className="text-[11px] text-midnight-ink font-bold truncate mt-0.5">{room.category}</p>
                  <p className="text-[11px] text-slate-mute font-medium">Floor {room.floor} &bull; ${room.basePrice}/nt</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-mute mb-1 uppercase tracking-wider">
                    Status
                  </div>
                  <select
                    value={room.housekeepingStatus}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    className={`w-full text-[11px] font-bold py-1 px-2 rounded-full border ${hkStyle} focus:outline-none cursor-pointer`}
                  >
                    <option value="clean" className="bg-white text-midnight-ink font-bold">Clean</option>
                    <option value="inspected" className="bg-white text-midnight-ink font-bold">Inspected</option>
                    <option value="dirty" className="bg-white text-midnight-ink font-bold">Dirty</option>
                    <option value="maintenance" className="bg-white text-midnight-ink font-bold">Maintenance</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Check-In Key Issuance Modal */}
      {checkInModal.open && checkInModal.booking && (
        <div className="fixed inset-0 z-50 bg-midnight-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-plaster-white border border-midnight-ink rounded-card max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-midnight-ink text-lg tracking-tight flex items-center gap-2">
                <Key className="w-5 h-5 text-voltage-lime fill-midnight-ink" />
                Issue Key Card & Complete Check-In
              </h3>
              <button
                onClick={() => setCheckInModal({ open: false, booking: null, keyNumber: "" })}
                className="text-slate-mute hover:text-midnight-ink text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-bone-canvas border border-slate-200 space-y-1.5 text-midnight-ink">
                <p>
                  <strong>Guest:</strong> {checkInModal.booking.guestDetails?.name}
                </p>
                <p>
                  <strong>Room:</strong> #{checkInModal.booking.room?.roomNumber} (
                  {checkInModal.booking.room?.category})
                </p>
                <p>
                  <strong>Booking Ref:</strong> {checkInModal.booking.bookingNumber}
                </p>
                <p>
                  <strong>Stay:</strong> {checkInModal.booking.nights} night(s)
                </p>
              </div>

              <div>
                <label className="block text-midnight-ink font-bold mb-1">
                  Physical Key / Smart Card Tag Number:
                </label>
                <input
                  type="text"
                  value={checkInModal.keyNumber}
                  onChange={(e) =>
                    setCheckInModal({ ...checkInModal, keyNumber: e.target.value })
                  }
                  placeholder={`KEY-${checkInModal.booking.room?.roomNumber}`}
                  className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2.5 text-midnight-ink font-mono text-xs focus:outline-none focus:border-midnight-ink"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCheckInModal({ open: false, booking: null, keyNumber: "" })}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={executeCheckIn}
                className="btn-lime text-xs"
              >
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
