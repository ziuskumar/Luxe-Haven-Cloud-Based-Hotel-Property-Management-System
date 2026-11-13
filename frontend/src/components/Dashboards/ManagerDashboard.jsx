import React, { useState, useEffect } from "react";
import API from "../../api";
import {
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  BedDouble,
  Save,
  Check,
  RefreshCw,
} from "lucide-react";

export default function ManagerDashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic pricing rule defaults
  const [pricingRules, setPricingRules] = useState({
    weekendMultiplier: 1.15,
    seasonalMultiplier: 1.1,
    surgeThreshold: 0.8,
    surgeMultiplier: 1.25,
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await API.get("/rooms");
      setRooms(res.data.rooms || []);
      if (res.data.rooms && res.data.rooms.length > 0) {
        const first = res.data.rooms[0].dynamicPricing;
        if (first) {
          setPricingRules({
            weekendMultiplier: first.weekendMultiplier || 1.15,
            seasonalMultiplier: first.seasonalMultiplier || 1.1,
            surgeThreshold: first.surgeThreshold || 0.8,
            surgeMultiplier: first.surgeMultiplier || 1.25,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const savePricingRules = async () => {
    try {
      for (const r of rooms) {
        await API.put(`/rooms/${r._id}`, {
          dynamicPricing: pricingRules,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update pricing rules: " + (err.response?.data?.message || err.message));
    }
  };

  const handleBasePriceChange = async (roomId, newPrice) => {
    try {
      await API.put(`/rooms/${roomId}`, { basePrice: Number(newPrice) });
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, basePrice: Number(newPrice) } : r))
      );
    } catch (err) {
      alert("Failed to update room price.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Saturated Bordeaux Maroon Band (#780016) */}
      <div className="bg-bordeaux-maroon text-plaster-white rounded-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-voltage-lime mb-2">
            Operations & Yield Management
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Dynamic Pricing & <span className="text-voltage-lime">Yield Algorithm</span>
          </h1>
          <p className="text-xs sm:text-sm text-plaster-white/90 mt-2 font-medium">
            Configure dynamic surcharge multipliers, seasonal factors, and monitor room inventory rates.
          </p>
        </div>

        <button
          onClick={fetchRooms}
          className="btn-lime text-xs px-5 py-2.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {/* Dynamic Pricing Engine Rules Panel - Plaster White (#ffffff) */}
      <div className="card-plaster space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-voltage-lime text-midnight-ink">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-midnight-ink text-base tracking-tight">
                Hotel Yield & Surge Pricing Algorithm
              </h3>
              <p className="text-xs text-slate-mute">
                Automatic rate adjustments based on day of week and hotel occupancy
              </p>
            </div>
          </div>

          <button
            onClick={savePricingRules}
            className="btn-lime text-xs px-5 py-2.5"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-midnight-ink" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? "Rules Applied!" : "Apply Dynamic Rules"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Weekend Multiplier */}
          <div className="bg-bone-canvas p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-midnight-ink">Weekend Surcharge</span>
              <span className="font-black text-midnight-ink font-mono text-sm">
                +{Math.round((pricingRules.weekendMultiplier - 1) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-mute">
              Applied automatically to Friday & Saturday night stays.
            </p>
            <input
              type="range"
              min="1.0"
              max="1.5"
              step="0.05"
              value={pricingRules.weekendMultiplier}
              onChange={(e) =>
                setPricingRules({ ...pricingRules, weekendMultiplier: parseFloat(e.target.value) })
              }
              className="w-full accent-midnight-ink cursor-pointer"
            />
            <div className="text-[10px] text-slate-mute flex justify-between font-bold">
              <span>1.0x (0%)</span>
              <span>1.25x (+25%)</span>
              <span>1.5x (+50%)</span>
            </div>
          </div>

          {/* Seasonal Multiplier */}
          <div className="bg-bone-canvas p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-midnight-ink">Peak Season Multiplier</span>
              <span className="font-black text-midnight-ink font-mono text-sm">
                {pricingRules.seasonalMultiplier}x
              </span>
            </div>
            <p className="text-[11px] text-slate-mute">
              High holiday season / local event base rate factor.
            </p>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={pricingRules.seasonalMultiplier}
              onChange={(e) =>
                setPricingRules({ ...pricingRules, seasonalMultiplier: parseFloat(e.target.value) })
              }
              className="w-full accent-midnight-ink cursor-pointer"
            />
            <div className="text-[10px] text-slate-mute flex justify-between font-bold">
              <span>0.8x (Low)</span>
              <span>1.0x (Standard)</span>
              <span>1.5x (Peak)</span>
            </div>
          </div>

          {/* Surge Occupancy Threshold */}
          <div className="bg-bone-canvas p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-midnight-ink">Surge Trigger Threshold</span>
              <span className="font-black text-midnight-ink font-mono text-sm">
                {Math.round(pricingRules.surgeThreshold * 100)}% Occ.
              </span>
            </div>
            <p className="text-[11px] text-slate-mute">
              Activates surge pricing when total hotel occupancy exceeds this rate.
            </p>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={pricingRules.surgeThreshold}
              onChange={(e) =>
                setPricingRules({ ...pricingRules, surgeThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-midnight-ink cursor-pointer"
            />
            <div className="text-[10px] text-slate-mute flex justify-between font-bold">
              <span>50%</span>
              <span>80% (Default)</span>
              <span>95%</span>
            </div>
          </div>

          {/* High Occupancy Surge Multiplier */}
          <div className="bg-bone-canvas p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-midnight-ink">High Occupancy Surge</span>
              <span className="font-black text-midnight-ink font-mono text-sm">
                +{Math.round((pricingRules.surgeMultiplier - 1) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-mute">
              Markup applied dynamically during high occupancy spikes.
            </p>
            <input
              type="range"
              min="1.05"
              max="1.5"
              step="0.05"
              value={pricingRules.surgeMultiplier}
              onChange={(e) =>
                setPricingRules({ ...pricingRules, surgeMultiplier: parseFloat(e.target.value) })
              }
              className="w-full accent-midnight-ink cursor-pointer"
            />
            <div className="text-[10px] text-slate-mute flex justify-between font-bold">
              <span>1.05x (+5%)</span>
              <span>1.25x (+25%)</span>
              <span>1.5x (+50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Inventory & Base Rates Matrix */}
      <div className="card-plaster">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-midnight-ink" />
              Room Inventory & Base Nightly Rates
            </h3>
            <p className="text-xs text-slate-mute">
              Adjust base room rates and view real-time occupancy state
            </p>
          </div>
          <span className="text-xs font-bold text-midnight-ink bg-bone-canvas px-3 py-1 rounded-full">
            {rooms.length} Rooms
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bone-canvas text-slate-mute font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Floor & Bed</th>
                <th className="p-3">Max Guests</th>
                <th className="p-3">Status</th>
                <th className="p-3">Base Price ($ / nt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-bone-canvas/50 transition">
                  <td className="p-3 font-black text-midnight-ink text-sm">#{room.roomNumber}</td>
                  <td className="p-3 text-midnight-ink font-bold">{room.category}</td>
                  <td className="p-3 text-slate-mute font-medium">
                    Floor {room.floor} &bull; {room.bedType}
                  </td>
                  <td className="p-3 text-slate-mute font-medium">
                    {room.maxOccupancy?.adults || 2} Adults, {room.maxOccupancy?.children || 1} Children
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        room.status === "occupied"
                          ? "bg-cobalt-signal text-plaster-white"
                          : room.status === "reserved"
                          ? "bg-saffron text-midnight-ink"
                          : "bg-voltage-lime text-midnight-ink"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 w-32">
                      <span className="text-slate-mute font-bold">$</span>
                      <input
                        type="number"
                        defaultValue={room.basePrice}
                        onBlur={(e) => handleBasePriceChange(room._id, e.target.value)}
                        className="w-20 bg-bone-canvas border border-slate-300 rounded-lg px-2 py-1 text-midnight-ink font-mono font-bold focus:outline-none focus:border-midnight-ink"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
