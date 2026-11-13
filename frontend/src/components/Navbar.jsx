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
  Sparkles,
  ClipboardList,
  Compass,
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }) {
  const { user, role, logout, switchDemoRole, isStaff, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (r) => {
    switch (r) {
      case "admin":
        return { label: "Admin", bg: "bg-midnight-ink text-voltage-lime border-midnight-ink" };
      case "hotel_manager":
        return { label: "Manager", bg: "bg-cobalt-signal text-plaster-white border-cobalt-signal" };
      case "receptionist":
        return { label: "Receptionist", bg: "bg-forest-depth text-voltage-lime border-forest-depth" };
      case "customer":
        return { label: "Customer", bg: "bg-bordeaux-maroon text-plaster-white border-bordeaux-maroon" };
      default:
        return { label: "Guest", bg: "bg-slate-200 text-midnight-ink border-slate-300" };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Banner Strip in Voltage Lime (#d2e823) */}
      <div className="bg-voltage-lime text-midnight-ink px-4 py-1.5 border-b border-black/10 text-xs font-medium flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-midnight-ink" />
          <span className="font-extrabold uppercase tracking-tight">RBAC Demo Switcher:</span>
          <span className="hidden sm:inline text-midnight-ink/80">
            Switch roles in 1-click to test dashboards & workflows
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => {
            const isActive = role === key;
            return (
              <button
                key={key}
                onClick={() => switchDemoRole(key)}
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition ${
                  isActive
                    ? "bg-midnight-ink text-voltage-lime font-black shadow-sm"
                    : "bg-white/80 hover:bg-white text-midnight-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Pill Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        <div className="bg-plaster-white border border-slate-200/90 rounded-pill px-4 sm:px-6 h-16 flex items-center justify-between shadow-[0_2px_12px_rgba(30,35,48,0.06)]">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-10 h-10 rounded-full bg-midnight-ink flex items-center justify-center text-voltage-lime font-black">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-midnight-ink">
                  LUXE HAVEN
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-mute font-medium tracking-wider uppercase -mt-0.5">
                Cloud Hotel PMS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "dashboard"
                  ? "bg-midnight-ink text-plaster-white"
                  : "text-midnight-ink hover:bg-bone-canvas"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "rooms"
                  ? "bg-midnight-ink text-plaster-white"
                  : "text-midnight-ink hover:bg-bone-canvas"
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>Rooms</span>
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "reservations"
                  ? "bg-midnight-ink text-plaster-white"
                  : "text-midnight-ink hover:bg-bone-canvas"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{isStaff ? "Reservations" : "My Bookings"}</span>
            </button>

            {isStaff && (
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  activeTab === "calendar"
                    ? "bg-midnight-ink text-plaster-white"
                    : "text-midnight-ink hover:bg-bone-canvas"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "invoices"
                  ? "bg-midnight-ink text-plaster-white"
                  : "text-midnight-ink hover:bg-bone-canvas"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Invoices</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  activeTab === "users"
                    ? "bg-midnight-ink text-plaster-white"
                    : "text-midnight-ink hover:bg-bone-canvas"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>RBAC</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("landing")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === "landing"
                  ? "bg-voltage-lime text-midnight-ink font-black shadow-sm"
                  : "text-midnight-ink hover:bg-bone-canvas"
              }`}
              title="View Public Hero Landing Page"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-bone-canvas text-midnight-ink hover:bg-slate-200 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-voltage-lime text-midnight-ink text-[10px] font-black border border-midnight-ink">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-plaster-white border border-midnight-ink shadow-2xl py-3 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-midnight-ink text-sm">Notifications</span>
                      <span className="text-[10px] bg-voltage-lime text-midnight-ink px-2 py-0.5 rounded-full font-bold">
                        Socket.IO Live
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-cobalt-signal hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-mute text-xs">
                        No notifications yet. Real-time PMS events will appear here!
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id || Math.random()}
                          onClick={() => !n.isRead && markAsRead(n._id)}
                          className={`p-3 text-xs cursor-pointer transition ${
                            n.isRead ? "bg-white opacity-60" : "bg-bone-canvas/70 hover:bg-bone-canvas"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-midnight-ink">{n.title}</span>
                            <span className="text-[10px] text-slate-mute whitespace-nowrap">
                              {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-slate-mute mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Sign In */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2 bg-bone-canvas py-1 px-2.5 rounded-full border border-slate-200">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="hidden lg:inline text-xs font-bold text-midnight-ink">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-full bg-bone-canvas hover:bg-red-50 text-slate-mute hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn-lime text-xs px-4 py-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
