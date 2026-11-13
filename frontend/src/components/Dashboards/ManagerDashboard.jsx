import React, { useState, useEffect } from "react";
import API from "../../api";
import {
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  BedDouble,
  ShieldAlert,
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
      // Update dynamic pricing across active rooms
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
      {/* Manager Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            Hotel Manager Operations & Yield Management
            <span className="text-xs font-sans font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
              Dynamic Pricing Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic rate multipliers, surge thresholds, and supervise room inventory
          </p>
        </div>

        <button
          onClick={fetchRooms}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Dynamic Pricing Engine Rules Panel */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Hotel Yield & Surge Pricing Algorithm</h3>
              <p className="text-xs text-slate-400">
                Automatic rate adjustments based on day of week and real-time hotel occupancy
              </p>
            </div>
          </div>

          <button
            onClick={savePricingRules}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? "Rules Applied!" : "Apply Dynamic Rules"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Weekend Multiplier */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Weekend Surcharge</span>
              <span className="font-mono text-sky-400 font-bold">
                +{Math.round((pricingRules.weekendMultiplier - 1) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
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
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>1.0x (0%)</span>
              <span>1.25x (+25%)</span>
              <span>1.5x (+50%)</span>
            </div>
          </div>

          {/* Seasonal Multiplier */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Peak Season Multiplier</span>
              <span className="font-mono text-sky-400 font-bold">
                {pricingRules.seasonalMultiplier}x
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
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
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>0.8x (Low)</span>
              <span>1.0x (Standard)</span>
              <span>1.5x (Peak)</span>
            </div>
          </div>

          {/* Surge Occupancy Threshold */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Surge Trigger Threshold</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(pricingRules.surgeThreshold * 100)}% Occ.
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
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
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>50%</span>
              <span>80% (Default)</span>
              <span>95%</span>
            </div>
          </div>

          {/* High Occupancy Surge Multiplier */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">High Occupancy Surge</span>
              <span className="font-mono text-emerald-400 font-bold">
                +{Math.round((pricingRules.surgeMultiplier - 1) * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Additional markup dynamically applied during high occupancy spikes.
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
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>1.05x (+5%)</span>
              <span>1.25x (+25%)</span>
              <span>1.5x (+50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Inventory & Base Rates Matrix */}
      <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-sky-400" />
              Room Inventory & Base Nightly Rates
            </h3>
            <p className="text-xs text-slate-400">
              Directly adjust base room rates and view real-time occupancy state
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{rooms.length} Total Rooms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Floor & Bed</th>
                <th className="p-3">Max Guests</th>
                <th className="p-3">Status</th>
                <th className="p-3">Base Price ($ / nt)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3 font-bold text-white">#{room.roomNumber}</td>
                  <td className="p-3 text-slate-300 font-medium">{room.category}</td>
                  <td className="p-3 text-slate-400">
                    Floor {room.floor} &bull; {room.bedType}
                  </td>
                  <td className="p-3 text-slate-400">
                    {room.maxOccupancy?.adults || 2} Adults, {room.maxOccupancy?.children || 1} Children
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        room.status === "occupied"
                          ? "bg-sky-950 text-sky-300 border border-sky-800"
                          : room.status === "reserved"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 w-32">
                      <span className="text-slate-400">$</span>
                      <input
                        type="number"
                        defaultValue={room.basePrice}
                        onBlur={(e) => handleBasePriceChange(room._id, e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-sky-500"
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
