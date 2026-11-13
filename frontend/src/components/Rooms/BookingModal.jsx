import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  Sparkles,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

const ADDON_SERVICES = [
  { id: "limo", name: "Airport Limousine Transfer", cost: 50 },
  { id: "breakfast", name: "Gourmet Breakfast Buffet", cost: 35 },
  { id: "champagne", name: "Chilled Champagne in Room", cost: 65 },
  { id: "spa", name: "Full-Body Wellness Spa Pass", cost: 110 },
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

  useEffect(() => {
    if (!room || !checkInDate || !checkOutDate) return;

    let isMounted = true;
    const updatePreview = async () => {
      // 1. Availability check
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

      // 2. Price calculation
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
      alert("Room is unavailable for chosen dates.");
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
    <div className="fixed inset-0 z-50 bg-midnight-ink/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-plaster-white border border-midnight-ink rounded-card max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-midnight-ink">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-3 py-0.5 rounded-full bg-voltage-lime text-midnight-ink">
                Room #{room.roomNumber}
              </span>
              <span className="text-xs text-slate-mute font-bold">{room.category}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{room.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-mute hover:text-midnight-ink text-lg font-bold p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          {/* Stay Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-midnight-ink mb-1">Check-In Date</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2.5 text-xs text-midnight-ink font-semibold focus:outline-none focus:border-midnight-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-midnight-ink mb-1">Check-Out Date</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2.5 text-xs text-midnight-ink font-semibold focus:outline-none focus:border-midnight-ink"
              />
            </div>
          </div>

          {/* Double-Booking Prevention Banner */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 font-bold transition ${
              availability.available
                ? "bg-voltage-lime/20 border-black/10 text-midnight-ink"
                : "bg-bordeaux-maroon text-plaster-white border-bordeaux-maroon"
            }`}
          >
            {availability.available ? (
              <CheckCircle2 className="w-4 h-4 text-forest-depth flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-voltage-lime flex-shrink-0" />
            )}
            <span>
              {availability.checking ? "Verifying availability engine..." : availability.message}
            </span>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-mute font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2 text-xs font-semibold text-midnight-ink focus:outline-none focus:border-midnight-ink"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-mute font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2 text-xs font-semibold text-midnight-ink focus:outline-none focus:border-midnight-ink"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-mute font-bold mb-1">Phone</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2 text-xs font-semibold text-midnight-ink focus:outline-none focus:border-midnight-ink"
              />
            </div>
          </div>

          {/* Extra Services & Add-ons */}
          <div className="bg-bone-canvas p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-extrabold text-midnight-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-midnight-ink" />
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
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? "bg-plaster-white border-midnight-ink shadow-sm font-bold text-midnight-ink"
                        : "bg-plaster-white/60 border-slate-200 text-slate-mute hover:bg-white"
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{addon.name}</span>
                      <span className="text-[11px] text-slate-mute">+${addon.cost}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-forest-depth" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promo Code & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-mute font-bold mb-1">
                Promo Code (LUXE10 or WELCOME20)
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="LUXE10"
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2.5 text-xs text-midnight-ink font-mono font-bold uppercase focus:outline-none focus:border-midnight-ink"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-mute font-bold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-bone-canvas border border-slate-300 rounded-lg p-2.5 text-xs text-midnight-ink font-bold focus:outline-none cursor-pointer"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI / Instant QR Payment</option>
                <option value="online">Online Payment Gateway</option>
                <option value="cash">Pay at Front Desk</option>
              </select>
            </div>
          </div>

          {/* Itemized Dynamic Pricing Summary Box */}
          {pricing && (
            <div className="bg-bone-canvas p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-black text-slate-mute tracking-wider">
                Itemized GST Billing Summary (18% Tax Included)
              </span>
              <div className="space-y-1.5 border-t border-slate-200 pt-2 text-midnight-ink font-medium">
                <div className="flex justify-between">
                  <span>Room Stay ({pricing.nights} night(s) &times; ${pricing.baseRatePerNight}):</span>
                  <span className="font-mono font-bold">${pricing.baseSubtotal}</span>
                </div>
                {pricing.dynamicAdjustment > 0 && (
                  <div className="flex justify-between text-cobalt-signal font-bold">
                    <span>Dynamic Surge Adjustment (Weekend/Yield):</span>
                    <span className="font-mono">+${pricing.dynamicAdjustment}</span>
                  </div>
                )}
                {pricing.extraServicesTotal > 0 && (
                  <div className="flex justify-between text-midnight-ink font-bold">
                    <span>Extra Add-on Amenities:</span>
                    <span className="font-mono">+${pricing.extraServicesTotal}</span>
                  </div>
                )}
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-forest-depth font-bold">
                    <span>Discount Applied ({pricing.discountCode}):</span>
                    <span className="font-mono">-${pricing.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-mute text-[11px] pt-1 border-t border-slate-200">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-bold">${pricing.taxableAmount}</span>
                </div>
                <div className="flex justify-between text-slate-mute text-[11px]">
                  <span>CGST (9%) + SGST (9%) - Total 18% GST:</span>
                  <span className="font-mono font-bold">+${pricing.taxAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-midnight-ink pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span className="font-mono font-black">${pricing.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !availability.available}
              className="btn-lime text-xs px-6 py-3 font-black"
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
