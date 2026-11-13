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
} from "recharts";

export default function AdminDashboard({ onNewBooking }) {
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-midnight-ink"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const charts = analytics?.charts || {};
  const monthlyRevenue = charts.monthlyRevenue || [];
  const statusDistribution = (charts.statusDistribution || []).map((s) => ({
    ...s,
    color:
      s.name === "Confirmed"
        ? "#254f1a"
        : s.name === "Checked In"
        ? "#2665d6"
        : s.name === "Checked Out"
        ? "#676b5f"
        : "#780016",
  }));
  const categoryData = charts.categoryData || [];
  const recentActivities = analytics?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Saturated Hero Banner - Cobalt Signal (#2665d6) */}
      <div className="bg-cobalt-signal text-plaster-white rounded-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-midnight-ink/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-voltage-lime mb-2">
            Executive Analytics & Hotel Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Financial Health & <span className="text-voltage-lime">Yield Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-plaster-white/90 mt-2 font-medium leading-relaxed">
            Real-time occupancy rates, RevPAR metrics, and audited operations across Luxe Haven.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range pill selector */}
          <div className="bg-plaster-white text-midnight-ink px-4 py-2 rounded-full border border-slate-200 text-xs font-bold flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-mute" />
            <span className="text-slate-mute">Period:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent font-extrabold text-midnight-ink focus:outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="year_to_date">Year to Date</option>
              <option value="all_time">All Time</option>
            </select>
          </div>

          <button onClick={onNewBooking} className="btn-lime text-xs px-5 py-2.5">
            <PlusCircle className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Plaster White (#ffffff) on Bone Canvas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Rev</span>
            <div className="p-1.5 rounded-full bg-voltage-lime text-midnight-ink font-bold">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            ${Number(kpis.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] font-bold text-forest-depth flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Settled Invoices</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">Occupancy</span>
            <div className="p-1.5 rounded-full bg-cobalt-signal text-plaster-white font-bold">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            {kpis.occupancyRate || 0}%
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-mute">
            {kpis.occupiedRooms || 0} / {kpis.totalRooms || 0} Rooms Occupied
          </div>
        </div>

        {/* Total Bookings */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">Bookings</span>
            <div className="p-1.5 rounded-full bg-midnight-ink text-voltage-lime font-bold">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            {kpis.totalBookings || 0}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-mute">
            Total in period
          </div>
        </div>

        {/* Available Rooms */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">Available</span>
            <div className="p-1.5 rounded-full bg-voltage-lime text-midnight-ink font-bold">
              <BedDouble className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            {kpis.availableRooms || 0}
          </div>
          <div className="mt-2 text-[11px] font-bold text-forest-depth">
            Ready for guests
          </div>
        </div>

        {/* RevPAR */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">RevPAR</span>
            <div className="p-1.5 rounded-full bg-saffron text-midnight-ink font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            ${Number(kpis.revPAR || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-mute">
            Yield efficiency
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="card-plaster flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-mute">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <div className="p-1.5 rounded-full bg-bordeaux-maroon text-plaster-white font-bold">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-midnight-ink tracking-tight">
            ${Number(kpis.pendingRevenue || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] font-bold text-bordeaux-maroon">
            Unsettled balance
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (Area Chart) */}
        <div className="lg:col-span-2 card-plaster">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-midnight-ink text-base tracking-tight">
                Gross Revenue & Bookings Trend
              </h3>
              <p className="text-xs text-slate-mute">Monthly yield breakdown in USD</p>
            </div>
            <span className="text-[11px] font-bold bg-voltage-lime text-midnight-ink px-2.5 py-1 rounded-full">
              Recharts Engine
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2665d6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2665d6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#1e2330" fontSize={11} fontWeight={600} />
                <YAxis stroke="#1e2330" fontSize={11} fontWeight={600} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e2330",
                    borderColor: "#1e2330",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#d2e823" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2665d6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution (Donut Chart) */}
        <div className="card-plaster flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-midnight-ink text-base tracking-tight">
              Booking Status Breakdown
            </h3>
            <p className="text-xs text-slate-mute">Reservation distribution</p>
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
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e2330",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-midnight-ink font-medium">{item.name}:</span>
                <span className="font-extrabold text-midnight-ink ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="card-plaster">
          <h3 className="font-extrabold text-midnight-ink text-base tracking-tight mb-1">
            Room Categories & Average Pricing
          </h3>
          <p className="text-xs text-slate-mute mb-4">Inventory density and base nightly rates</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="category"
                  stroke="#1e2330"
                  fontSize={10}
                  fontWeight={600}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis stroke="#1e2330" fontSize={11} fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e2330",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="avgPrice" fill="#d2e823" stroke="#1e2330" strokeWidth={1} name="Avg Rate ($)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Front Desk Live Audit Log */}
        <div className="card-plaster flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-midnight-ink text-base tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-cobalt-signal" />
                Live Front Desk Activity Log
              </h3>
              <p className="text-xs text-slate-mute">Audited event stream of front-desk operations</p>
            </div>
            <span className="text-[10px] font-bold bg-midnight-ink text-voltage-lime px-2 py-0.5 rounded-full">
              Audited
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 space-y-2.5 pr-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-mute text-center py-6">No recent actions recorded.</p>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-3 rounded-2xl bg-bone-canvas border border-slate-200/60 flex items-start justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-midnight-ink">
                      {act.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-mute text-[11px] ml-2 font-medium">
                      by {act.userName} ({act.userRole})
                    </span>
                    {act.details?.bookingNumber && (
                      <p className="text-slate-mute text-[11px] mt-0.5">
                        Ref: {act.details.bookingNumber} &bull; Room #{act.details.roomNumber || "N/A"}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-mute font-medium whitespace-nowrap">
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
