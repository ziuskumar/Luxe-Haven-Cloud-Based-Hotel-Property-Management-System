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
  CheckCircle2,
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
        return "bg-forest-depth text-plaster-white";
      case "checked_in":
        return "bg-cobalt-signal text-plaster-white";
      case "checked_out":
        return "bg-cement-gray text-midnight-ink";
      case "cancelled":
        return "bg-bordeaux-maroon text-plaster-white";
      default:
        return "bg-saffron text-midnight-ink";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="card-plaster p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-voltage-lime text-midnight-ink">
                PMS Engine
              </span>
              <span className="text-xs font-bold text-slate-mute">Reservation Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-ink tracking-tight font-display">
              {isStaff ? "Central Reservation System (CRS)" : "My Bookings & Reservations"}
            </h1>
            <p className="text-xs text-slate-mute mt-1">
              Real-time reservations tracking, key card issuance, check-in / check-out workflows, and billing receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-mute" />
              <input
                type="text"
                placeholder="Search booking # or guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchBookings()}
                className="w-full bg-bone-canvas border border-cement-gray rounded-input pl-9 pr-3.5 py-2 text-xs text-midnight-ink placeholder-slate-mute focus:outline-none focus:border-midnight-ink font-medium"
              />
            </div>

            <button
              onClick={fetchBookings}
              className="p-2.5 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink border border-cement-gray transition font-bold"
              title="Refresh Bookings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-3 border-t border-cement-gray">
          <span className="text-slate-mute font-bold text-[11px] uppercase tracking-wider">Status:</span>
          {["all", "confirmed", "checked_in", "checked_out", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full capitalize transition font-bold text-xs ${
                statusFilter === st
                  ? "bg-midnight-ink text-plaster-white"
                  : "bg-bone-canvas text-slate-mute hover:bg-cement-gray hover:text-midnight-ink"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="card-plaster overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-ink"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center text-slate-mute text-xs">
            No reservations found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bone-canvas text-slate-mute font-bold uppercase tracking-wider text-[11px] border-b border-cement-gray">
                <tr>
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Dates & Nights</th>
                  <th className="p-4">Key Card</th>
                  <th className="p-4">Total & Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cement-gray/60 font-medium">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-bone-canvas/60 transition">
                    <td className="p-4 font-mono font-bold text-midnight-ink">
                      {b.bookingNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-midnight-ink">{b.guestDetails?.name}</div>
                      <div className="text-[11px] text-slate-mute">{b.guestDetails?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-midnight-ink">Room #{b.room?.roomNumber}</span>
                      <div className="text-[11px] text-slate-mute capitalize">{b.room?.category}</div>
                    </td>
                    <td className="p-4 text-midnight-ink font-medium">
                      <div>
                        {new Date(b.checkInDate).toLocaleDateString()} &rarr;{" "}
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-mute">{b.nights} Night(s)</div>
                    </td>
                    <td className="p-4">
                      {b.roomKeyIssued ? (
                        <span className="font-mono text-midnight-ink font-bold bg-voltage-lime px-2.5 py-0.5 rounded-full text-[11px] inline-block">
                          {b.roomKeyNumber}
                        </span>
                      ) : (
                        <span className="text-slate-mute italic">Not Issued</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-midnight-ink font-mono">${b.pricing?.totalAmount}</div>
                      <div className="text-[10px] text-forest-depth uppercase font-bold tracking-wider">
                        {b.paymentStatus}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Invoice download */}
                        <button
                          onClick={() => downloadInvoice(b._id)}
                          className="p-2 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink border border-cement-gray transition"
                          title="Download Invoice PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Front desk actions */}
                        {isStaff && b.status === "confirmed" && (
                          <button
                            onClick={() => handleCheckIn(b._id, b.room?.roomNumber)}
                            className="btn-lime text-xs px-3.5 py-1.5"
                          >
                            Check-In
                          </button>
                        )}

                        {isStaff && b.status === "checked_in" && (
                          <button
                            onClick={() => handleCheckOut(b._id)}
                            className="btn-black text-xs px-3.5 py-1.5"
                          >
                            Check-Out
                          </button>
                        )}

                        {b.status !== "checked_out" && b.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="p-2 rounded-full bg-bone-canvas hover:bg-bordeaux-maroon/10 text-slate-mute hover:text-bordeaux-maroon transition"
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
