import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Key,
  LogIn,
  LogOut,
  FileDown,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
} from "lucide-react";

export default function BookingsList({ onSelectBooking }) {
  const { isStaff } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await API.get(`/bookings?${params.toString()}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleCheckIn = async (bookingId, roomNumber) => {
    const key = window.prompt("Assign Key Card Number:", `KEY-${roomNumber}`);
    if (key === null) return;
    try {
      await API.post(`/bookings/${bookingId}/check-in`, { roomKeyNumber: key });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!window.confirm("Confirm check-out? Room will be set to Dirty for housekeeping.")) return;
    try {
      await API.post(`/bookings/${bookingId}/check-out`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Cancellation Reason:", "Customer Request");
    if (reason === null) return;
    try {
      await API.post(`/bookings/${bookingId}/cancel`, { reason });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const res = await API.get("/invoices");
      const inv = (res.data.invoices || []).find(
        (i) => i.booking?._id === bookingId || i.booking === bookingId
      );
      if (!inv) {
        alert("Invoice not found.");
        return;
      }
      window.open(`/api/invoices/${inv._id}/download`, "_blank");
    } catch (err) {
      alert("Failed to download invoice");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case "checked_in":
        return "bg-sky-950 text-sky-300 border-sky-800";
      case "checked_out":
        return "bg-slate-800 text-slate-400 border-slate-700";
      case "cancelled":
        return "bg-red-950 text-red-300 border-red-800";
      default:
        return "bg-amber-950 text-amber-300 border-amber-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
              {isStaff ? "Central Reservation System (CRS)" : "My Bookings & Reservations"}
              <span className="text-xs font-sans font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2.5 py-0.5 rounded-full">
                PMS Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live reservations tracking, room keys, check-in / check-out workflows, and invoices
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search booking # or guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchBookings()}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Bookings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-700/60">
          <span className="text-slate-400">Reservation Status:</span>
          {["all", "confirmed", "checked_in", "checked_out", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full capitalize transition font-medium ${
                statusFilter === st
                  ? "bg-sky-600 text-white font-semibold shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-800/50 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No reservations found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="p-3.5">Ref #</th>
                  <th className="p-3.5">Guest</th>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Dates & Nights</th>
                  <th className="p-3.5">Key Card</th>
                  <th className="p-3.5">Total & Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5 font-bold font-mono text-sky-400">
                      {b.bookingNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{b.guestDetails?.name}</div>
                      <div className="text-[11px] text-slate-400">{b.guestDetails?.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white">Room #{b.room?.roomNumber}</span>
                      <div className="text-[11px] text-slate-400">{b.room?.category}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>
                        {new Date(b.checkInDate).toLocaleDateString()} &rarr;{" "}
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.nights} Night(s)</div>
                    </td>
                    <td className="p-3.5">
                      {b.roomKeyIssued ? (
                        <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                          {b.roomKeyNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white font-mono">${b.pricing?.totalAmount}</div>
                      <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                        {b.paymentStatus}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Invoice download */}
                        <button
                          onClick={() => downloadInvoice(b._id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
                          title="Download Invoice PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Front desk actions */}
                        {isStaff && b.status === "confirmed" && (
                          <button
                            onClick={() => handleCheckIn(b._id, b.room?.roomNumber)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow transition"
                          >
                            Check-In
                          </button>
                        )}

                        {isStaff && b.status === "checked_in" && (
                          <button
                            onClick={() => handleCheckOut(b._id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] shadow transition"
                          >
                            Check-Out
                          </button>
                        )}

                        {b.status !== "checked_out" && b.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
