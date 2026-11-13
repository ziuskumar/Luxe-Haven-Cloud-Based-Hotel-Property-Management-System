import React, { useState, useEffect } from "react";
import API from "../../api";
import {
  DollarSign,
  TrendingUp,
  BedDouble,
  CalendarCheck,
  Percent,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Activity,
  Receipt,
  ShieldCheck,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard({ onNewBooking, onNewRoom }) {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (range) => {
    setLoading(true);
    try {
      const res = await API.get(`/analytics?range=${range}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};
  const monthlyRevenue = charts.monthlyRevenue || [];
  const statusDistribution = charts.statusDistribution || [];
  const categoryData = charts.categoryData || [];
  const recentTransactions = analytics?.recentTransactions || [];
  const recentActivities = analytics?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            Executive Analytics & Hotel Overview
            <span className="text-xs font-sans font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
              Live Recharts
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial performance, occupancy rates, and PMS activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Filter:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="today" className="bg-slate-900">Today</option>
              <option value="7days" className="bg-slate-900">Last 7 Days</option>
              <option value="30days" className="bg-slate-900">Last 30 Days</option>
              <option value="this_month" className="bg-slate-900">This Month</option>
              <option value="year_to_date" className="bg-slate-900">Year to Date</option>
              <option value="all_time" className="bg-slate-900">All Time</option>
            </select>
          </div>

          <button
            onClick={onNewBooking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            ${Number(kpis.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>Paid Invoices</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {kpis.occupancyRate || 0}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {kpis.occupiedRooms || 0} of {kpis.totalRooms || 0} Rooms Occupied
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Bookings</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {kpis.totalBookings || 0}
          </div>
          <div className="mt-1 text-[11px] text-indigo-400">
            In selected period
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {kpis.availableRooms || 0}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">
            Ready for booking
          </div>
        </div>

        {/* RevPAR */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">RevPAR</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            ${Number(kpis.revPAR || 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Rev. Per Avail. Room
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Rev.</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            ${Number(kpis.pendingRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-amber-400">
            Unsettled balance
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Revenue & Bookings Trend</h3>
              <p className="text-xs text-slate-400">Monthly gross revenue vs reservation count</p>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800">
              Interactive Recharts
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution (Pie Chart) */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-base">Booking Status Breakdown</h3>
            <p className="text-xs text-slate-400">Reservation state breakdown in current period</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#0284c7"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/60 pt-3">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300">{item.name}:</span>
                <span className="font-semibold text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Category Performance */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80">
          <h3 className="font-semibold text-white text-base mb-1">Room Categories & Pricing</h3>
          <p className="text-xs text-slate-400 mb-4">Inventory density and base rates per category</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="avgPrice" fill="#0ea5e9" name="Avg Rate ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Front Desk Live Activity Feed */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Front Desk Activity Log
              </h3>
              <p className="text-xs text-slate-400">Real-time check-in, check-out, and billing actions</p>
            </div>
            <span className="text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Audited
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 space-y-2.5 pr-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent actions recorded.</p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-start justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{act.action.replace(/_/g, " ")}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">
                      by {act.userName} ({act.userRole})
                    </span>
                    {act.details?.bookingNumber && (
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Ref: {act.details.bookingNumber} | Room #{act.details.roomNumber || "N/A"}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
