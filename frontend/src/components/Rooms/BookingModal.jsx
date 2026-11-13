import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Clock,
  Sparkles,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Gift,
  Plus,
} from "lucide-react";

const ADDON_SERVICES = [
  { id: "limo", name: "Airport Limousine Transfer", cost: 50 },
  { id: "breakfast", name: "Executive Gourmet Breakfast Buffet", cost: 35 },
  { id: "champagne", name: "Chilled Champagne & Chocolates in Room", cost: 65 },
  { id: "spa", name: "Full-Body Rejuvenation Spa Pass", cost: 110 },
];

export default function BookingModal({ room, onClose, onSuccess }) {
  const { user } = useAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkInDate, setCheckInDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState(dayAfter.toISOString().split("T")[0]);
  const [guestName, setGuestName] = useState(user?.name || "Sophia Montgomery");
  const [guestEmail, setGuestEmail] = useState(user?.email || "guest@luxehaven.com");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "+1 (555) 012-3456");
  const [specialRequests, setSpecialRequests] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [promoCode, setPromoCode] = useState("LUXE10");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [pricing, setPricing] = useState(null);
  const [availability, setAvailability] = useState({ checking: false, available: true, message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Recalculate price and availability whenever dates/addons/promo change
  useEffect(() => {
    if (!room || !checkInDate || !checkOutDate) return;

    let isMounted = true;
    const updatePreview = async () => {
      // 1. Check availability
      try {
        setAvailability((prev) => ({ ...prev, checking: true }));
        const availRes = await API.get(
          `/bookings/check-availability?roomId=${room._id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
        );
        if (isMounted) {
          setAvailability({
            checking: false,
            available: availRes.data.isAvailable,
            message: availRes.data.isAvailable
              ? "Room is completely available for selected dates."
              : `Conflict detected with booking ${availRes.data.conflictingBooking?.bookingNumber}. Double-booking prevented!`,
          });
        }
      } catch (err) {
        if (isMounted) {
          setAvailability({
            checking: false,
            available: false,
            message: err.response?.data?.message || "Unavailable",
          });
        }
      }

      // 2. Calculate dynamic price
      try {
        const extraServices = selectedAddons.map((id) => {
          const s = ADDON_SERVICES.find((a) => a.id === id);
          return { name: s.name, cost: s.cost };
        });

        const priceRes = await API.post("/bookings/calculate-price", {
          roomId: room._id,
          checkInDate,
          checkOutDate,
          promoCode,
          extraServices,
        });

        if (isMounted) {
          setPricing(priceRes.data.pricing);
        }
      } catch (err) {
        console.error("Pricing preview error:", err);
      }
    };

    updatePreview();
    return () => {
      isMounted = false;
    };
  }, [room, checkInDate, checkOutDate, promoCode, selectedAddons]);

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!availability.available) {
      alert("Room is not available for chosen dates. Please pick another date range.");
      return;
    }

    setSubmitting(true);
    try {
      const extraServices = selectedAddons.map((id) => {
        const s = ADDON_SERVICES.find((a) => a.id === id);
        return { name: s.name, cost: s.cost };
      });

      const res = await API.post("/bookings", {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestDetails: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          specialRequests,
        },
        numberOfGuests: { adults: Number(adults), children: Number(children) },
        promoCode,
        extraServices,
        paymentMethod,
        paymentStatus: "paid",
      });

      onSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Booking submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                Room #{room.roomNumber}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{room.category}</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white mt-1">{room.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-base p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          {/* Stay Dates & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Check-In Date</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Check-Out Date</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Double-Booking Prevention Banner */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition ${
              availability.available
                ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                : "bg-red-950/50 border-red-800 text-red-300"
            }`}
          >
            {availability.available ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className="font-medium">
              {availability.checking ? "Verifying availability engine..." : availability.message}
            </span>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email (for Confirmation)</label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Extra Services & Add-ons */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Enhance Your Luxury Stay (Add-on Services)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ADDON_SERVICES.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                      isSelected
                        ? "bg-sky-950 border-sky-600 text-sky-200"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <span className="font-medium block">{addon.name}</span>
                      <span className="text-[11px] text-slate-400">+${addon.cost}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promo Code & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Discount / Promo Code (Try LUXE10 or WELCOME20)
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="LUXE10"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="card">Credit / Debit Card (Instant)</option>
                <option value="upi">UPI / Instant QR Payment</option>
                <option value="online">Online Payment Gateway</option>
                <option value="cash">Pay at Front Desk</option>
              </select>
            </div>
          </div>

          {/* Itemized Dynamic Pricing Summary Box */}
          {pricing && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Automated Itemized Billing & GST Breakdown
              </span>
              <div className="space-y-1.5 border-t border-slate-800/80 pt-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Room Stay ({pricing.nights} night(s) &times; ${pricing.baseRatePerNight}):</span>
                  <span className="font-mono text-white">${pricing.baseSubtotal}</span>
                </div>
                {pricing.dynamicAdjustment > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Dynamic Surge Adjustment (Weekend/Demand):</span>
                    <span className="font-mono">+${pricing.dynamicAdjustment}</span>
                  </div>
                )}
                {pricing.extraServicesTotal > 0 && (
                  <div className="flex justify-between text-sky-400">
                    <span>Extra Add-on Services:</span>
                    <span className="font-mono">+${pricing.extraServicesTotal}</span>
                  </div>
                )}
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Applied ({pricing.discountCode}):</span>
                    <span className="font-mono">-${pricing.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">${pricing.taxableAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>CGST (9%) + SGST (9%) - Total 18% GST:</span>
                  <span className="font-mono">+${pricing.taxAmount}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span className="text-white">Estimated Grand Total:</span>
                  <span className="font-mono">${pricing.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !availability.available}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{submitting ? "Processing..." : "Confirm Reservation & Generate Invoice"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
