import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useSocket } from "./context/SocketContext";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/Dashboards/AdminDashboard";
import ManagerDashboard from "./components/Dashboards/ManagerDashboard";
import ReceptionistDashboard from "./components/Dashboards/ReceptionistDashboard";
import CustomerDashboard from "./components/Dashboards/CustomerDashboard";
import RoomsList from "./components/Rooms/RoomsList";
import BookingsList from "./components/Reservations/BookingsList";
import BookingCalendar from "./components/Calendar/BookingCalendar";
import InvoicesList from "./components/Invoices/InvoicesList";
import UsersList from "./components/Users/UsersList";
import AuthModal from "./components/AuthModal";
import { Bell, Sparkles, X } from "lucide-react";

export default function App() {
  const { role, isStaff, isAdmin } = useAuth();
  const { toastAlert, setToastAlert } = useSocket();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return (
          <AdminDashboard
            onNewBooking={() => setActiveTab("rooms")}
            onNewRoom={() => setActiveTab("rooms")}
          />
        );
      case "hotel_manager":
        return <ManagerDashboard />;
      case "receptionist":
        return <ReceptionistDashboard onRefreshCalendar={() => {}} />;
      case "customer":
      default:
        return <CustomerDashboard onBrowseRooms={() => setActiveTab("rooms")} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Real-Time Toast Notification Popup (Socket.IO) */}
      {toastAlert && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-800 border-2 border-sky-500 rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-bounce">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-sky-400">
                Socket.IO Live Alert
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{toastAlert.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toastAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastAlert(null)}
            className="text-slate-400 hover:text-white text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "rooms" && (
          <RoomsList
            onBookingComplete={() => {
              setActiveTab("reservations");
            }}
          />
        )}
        {activeTab === "reservations" && <BookingsList />}
        {activeTab === "calendar" && <BookingCalendar />}
        {activeTab === "invoices" && <InvoicesList />}
        {activeTab === "users" && isAdmin && <UsersList />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Luxe Haven Cloud-Based Hotel Property Management System (PMS).</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GST HSN: 9963</span>
            <span>&bull;</span>
            <span>REST API + Socket.IO</span>
            <span>&bull;</span>
            <span>JWT RBAC Enabled</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
