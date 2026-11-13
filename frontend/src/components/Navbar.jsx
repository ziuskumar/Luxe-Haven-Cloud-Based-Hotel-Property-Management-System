import React, { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  Hotel,
  Bell,
  Calendar,
  CreditCard,
  BedDouble,
  LayoutDashboard,
  Users,
  LogOut,
  LogIn,
  UserCheck,
  Check,
  ChevronDown,
  Sparkles,
  ClipboardList,
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }) {
  const { user, role, logout, switchDemoRole, isStaff, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const getRoleBadge = (r) => {
    switch (r) {
      case "admin":
        return { label: "Admin", bg: "bg-purple-950 text-purple-300 border-purple-800" };
      case "hotel_manager":
        return { label: "Hotel Manager", bg: "bg-sky-950 text-sky-300 border-sky-800" };
      case "receptionist":
        return { label: "Receptionist", bg: "bg-emerald-950 text-emerald-300 border-emerald-800" };
      case "customer":
        return { label: "Customer", bg: "bg-amber-950 text-amber-300 border-amber-800" };
      default:
        return { label: "Guest", bg: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Demo Role Switcher Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-300">RBAC Demo Switcher:</span>
          <span className="hidden sm:inline text-slate-500">Switch role in 1-click to test role-specific dashboards & permissions</span>
        </div>
        <div className="flex items-center gap-1">
          {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => {
            const isActive = role === key;
            return (
              <button
                key={key}
                onClick={() => switchDemoRole(key)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm font-semibold"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-white">LUXE HAVEN</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
                Cloud Hotel PMS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "dashboard"
                  ? "bg-slate-800 text-sky-400"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "rooms"
                  ? "bg-slate-800 text-sky-400"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>Rooms & Availability</span>
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "reservations"
                  ? "bg-slate-800 text-sky-400"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{isStaff ? "Reservations & Front Desk" : "My Bookings"}</span>
            </button>

            {isStaff && (
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === "calendar"
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Booking Calendar</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "invoices"
                  ? "bg-slate-800 text-sky-400"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Invoices & Billing</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === "users"
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff & RBAC</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Notifications & User Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Real-time Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      <span className="text-[11px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        Socket.IO Live
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-sky-400 hover:text-sky-300 transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications yet. Real-time PMS events will appear here!
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id || Math.random()}
                          onClick={() => !n.isRead && markAsRead(n._id)}
                          className={`p-3 text-xs cursor-pointer transition ${
                            n.isRead ? "bg-slate-800/50 opacity-70" : "bg-slate-700/40 hover:bg-slate-700/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-100">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
