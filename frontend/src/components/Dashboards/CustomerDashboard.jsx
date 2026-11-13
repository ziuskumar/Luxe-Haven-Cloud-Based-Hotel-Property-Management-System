import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  BedDouble,
  Calendar,
  Receipt,
  FileDown,
  XCircle,
  Clock,
  Sparkles,
  Key,
  CreditCard,
} from "lucide-react";

export default function CustomerDashboard({ onBrowseRooms }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Reason for cancellation (optional):", "Change of plans");
    if (reason === null) return;
    try {
      await API.post(`/bookings/${bookingId}/cancel`, { reason });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      // Find invoice for this booking
      const invRes = await API.get("/invoices");
      const inv = (invRes.data.invoices || []).find((i) => i.booking?._id === bookingId || i.booking === bookingId);
      if (!inv) {
        alert("Invoice not yet generated for this booking.");
        return;
      }
      window.open(`/api/invoices/${inv._id}/download`, "_blank");
    } catch (err) {
      alert("Failed to download invoice.");
    }
  };

  const activeStay = bookings.find((b) => b.status === "checked_in");
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");
  const pastBookings = bookings.filter((b) => b.status === "checked_out" || b.status === "cancelled");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Guest Privilege Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Welcome, {user?.name || "Esteemed Guest"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Manage your room reservations, track electronic room keys, access sequential GST tax invoices, and experience effortless hospitality.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onBrowseRooms}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
            >
              <BedDouble className="w-4 h-4" />
              <span>Book Another Luxury Stay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active In-House Stay Card */}
      {activeStay && (
        <div className="bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-sky-800/80 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-800/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-lg font-bold text-white font-serif">Your Active Stay Right Now</h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold uppercase">
                Checked In
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Key Issued: <strong>{activeStay.roomKeyNumber || "Front Desk Card"}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Room</span>
              <p className="text-white font-bold text-base mt-0.5">#{activeStay.room?.roomNumber}</p>
              <p className="text-slate-400">{activeStay.room?.title} ({activeStay.room?.category})</p>
            </div>
            <div>
              <span className="text-slate-400">Dates</span>
              <p className="text-white font-semibold mt-0.5">
                {new Date(activeStay.checkInDate).toLocaleDateString()} &rarr; {new Date(activeStay.checkOutDate).toLocaleDateString()}
              </p>
              <p className="text-slate-400">{activeStay.nights} Night(s)</p>
            </div>
            <div>
              <span className="text-slate-400">Total Billed</span>
              <p className="text-emerald-400 font-bold text-base mt-0.5">
                ${activeStay.pricing?.totalAmount || activeStay.paidAmount}
              </p>
              <p className="text-slate-400">Status: {activeStay.paymentStatus.toUpperCase()}</p>
            </div>
            <div className="flex items-center sm:justify-end">
              <button
                onClick={() => downloadInvoice(activeStay._id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-xs transition"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Tax Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Reservations */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            Upcoming Reservations ({upcomingBookings.length})
          </h3>
          <span className="text-xs text-slate-400">Confirmed Stays</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No upcoming trips booked right now.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">Room #{b.room?.roomNumber}</span>
                    <span className="text-slate-400">({b.room?.category})</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Check-in: <strong>{new Date(b.checkInDate).toLocaleDateString()}</strong> &bull; Check-out:{" "}
                    <strong>{new Date(b.checkOutDate).toLocaleDateString()}</strong> ({b.nights} nights)
                  </p>
                  <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                    Ref: {b.bookingNumber} &bull; Total: ${b.pricing?.totalAmount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadInvoice(b._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition"
                  >
                    <Receipt className="w-3.5 h-3.5 text-sky-400" />
                    <span>Invoice PDF</span>
                  </button>

                  <button
                    onClick={() => handleCancel(b._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 font-medium border border-red-900/50 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Stay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Trips / History */}
      {pastBookings.length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            Stay History & Past Invoices
          </h3>

          <div className="space-y-2.5">
            {pastBookings.map((b) => (
              <div
                key={b._id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/40 flex items-center justify-between text-xs opacity-80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">Room #{b.room?.roomNumber}</span>
                    <span className="text-slate-400">({b.room?.category})</span>
                    <span className="text-slate-500 capitalize">({b.status})</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()} &bull; Total: ${b.pricing?.totalAmount}
                  </p>
                </div>

                <button
                  onClick={() => downloadInvoice(b._id)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
