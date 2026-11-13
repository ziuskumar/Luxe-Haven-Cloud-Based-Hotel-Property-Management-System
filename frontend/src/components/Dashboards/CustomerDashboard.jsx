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
      {/* Saturated Cobalt Signal Welcome Banner (#2665d6) */}
      <div className="bg-cobalt-signal text-plaster-white rounded-card p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-midnight-ink/20 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-voltage-lime mb-3">
            <Sparkles className="w-3.5 h-3.5 text-voltage-lime" />
            <span>Guest Privilege Suite</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Welcome, <span className="text-voltage-lime">{user?.name || "Esteemed Guest"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-plaster-white/90 mt-3 leading-relaxed font-medium">
            Manage your room reservations, track electronic key cards, and download sequential GST tax invoices effortlessly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onBrowseRooms}
              className="btn-lime text-xs px-6 py-3 font-black"
            >
              <BedDouble className="w-4 h-4" />
              <span>Book Another Luxury Stay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Stay Card - Plaster White (#ffffff) */}
      {activeStay && (
        <div className="card-plaster border-2 border-cobalt-signal space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest-depth animate-ping"></span>
              <h2 className="text-xl font-extrabold text-midnight-ink tracking-tight">
                Your Active In-House Stay
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-midnight-ink text-voltage-lime text-[10px] font-black uppercase">
                Checked In
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-midnight-ink font-bold">
              <Key className="w-4 h-4 text-cobalt-signal" />
              <span>Key Issued: <strong>{activeStay.roomKeyNumber || "Front Desk Card"}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-mute uppercase text-[10px] font-bold">Room Assigned</span>
              <p className="text-midnight-ink font-black text-lg mt-0.5">#{activeStay.room?.roomNumber}</p>
              <p className="text-slate-mute font-medium">{activeStay.room?.title} ({activeStay.room?.category})</p>
            </div>
            <div>
              <span className="text-slate-mute uppercase text-[10px] font-bold">Stay Schedule</span>
              <p className="text-midnight-ink font-bold mt-0.5">
                {new Date(activeStay.checkInDate).toLocaleDateString()} &rarr; {new Date(activeStay.checkOutDate).toLocaleDateString()}
              </p>
              <p className="text-slate-mute font-medium">{activeStay.nights} Night(s)</p>
            </div>
            <div>
              <span className="text-slate-mute uppercase text-[10px] font-bold">Billing Total</span>
              <p className="text-forest-depth font-black text-lg mt-0.5">
                ${activeStay.pricing?.totalAmount || activeStay.paidAmount}
              </p>
              <p className="text-slate-mute font-bold uppercase text-[10px]">Status: {activeStay.paymentStatus}</p>
            </div>
            <div className="flex items-center sm:justify-end">
              <button
                onClick={() => downloadInvoice(activeStay._id)}
                className="btn-lime text-xs px-4 py-2 font-black"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Tax Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Reservations */}
      <div className="card-plaster space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cobalt-signal" />
            Upcoming Reservations ({upcomingBookings.length})
          </h3>
          <span className="text-xs font-bold text-slate-mute bg-bone-canvas px-3 py-1 rounded-full">
            Confirmed Stays
          </span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-mute text-xs">
            No upcoming trips booked right now.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-bone-canvas border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-midnight-ink text-base">Room #{b.room?.roomNumber}</span>
                    <span className="text-slate-mute font-semibold">({b.room?.category})</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-forest-depth text-voltage-lime text-[10px] font-black">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-midnight-ink font-semibold mt-1">
                    Check-in: <strong>{new Date(b.checkInDate).toLocaleDateString()}</strong> &bull; Check-out:{" "}
                    <strong>{new Date(b.checkOutDate).toLocaleDateString()}</strong> ({b.nights} nights)
                  </p>
                  <p className="text-slate-mute text-[11px] font-mono mt-0.5">
                    Ref: {b.bookingNumber} &bull; Total: ${b.pricing?.totalAmount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadInvoice(b._id)}
                    className="btn-black text-xs px-3.5 py-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoice PDF</span>
                  </button>

                  <button
                    onClick={() => handleCancel(b._id)}
                    className="btn-ghost text-xs text-bordeaux-maroon hover:text-bordeaux-maroon"
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

      {/* Past Trips */}
      {pastBookings.length > 0 && (
        <div className="card-plaster space-y-4">
          <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-slate-mute" />
            Stay History & Past Invoices
          </h3>

          <div className="space-y-2.5">
            {pastBookings.map((b) => (
              <div
                key={b._id}
                className="p-3.5 rounded-2xl bg-bone-canvas/70 border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-midnight-ink">Room #{b.room?.roomNumber}</span>
                    <span className="text-slate-mute">({b.room?.category})</span>
                    <span className="text-slate-mute capitalize text-[11px]">({b.status})</span>
                  </div>
                  <p className="text-slate-mute text-[11px] mt-0.5">
                    {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()} &bull; Total: ${b.pricing?.totalAmount}
                  </p>
                </div>

                <button
                  onClick={() => downloadInvoice(b._id)}
                  className="btn-black text-xs px-3 py-1"
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
