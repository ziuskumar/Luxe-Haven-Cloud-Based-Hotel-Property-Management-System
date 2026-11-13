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
    <div className="min-h-screen bg-bone-canvas text-midnight-ink flex flex-col selection:bg-voltage-lime selection:text-midnight-ink">
      {/* Real-Time Toast Notification Popup (Socket.IO) */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full card-plaster p-4 border border-cement-gray flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-voltage-lime text-midnight-ink">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-black text-midnight-ink bg-voltage-lime px-2 py-0.5 rounded-full">
                Socket.IO Live
              </span>
              <h4 className="text-sm font-black text-midnight-ink mt-1.5 font-display">{toastAlert.title}</h4>
              <p className="text-xs text-slate-mute mt-0.5 leading-relaxed font-medium">{toastAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastAlert(null)}
            className="w-7 h-7 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Main Navbar */}
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

      {/* Clean Editorial Footer */}
      <footer className="bg-plaster-white border-t border-cement-gray py-6 text-xs text-slate-mute">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-bold text-midnight-ink">
            &copy; {new Date().getFullYear()} Luxe Haven &mdash; Cloud-Based Hotel Property Management System (PMS).
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-mute">
            <span>GST HSN: 9963</span>
            <span>&bull;</span>
            <span>REST API + Socket.IO</span>
            <span>&bull;</span>
            <span className="text-midnight-ink font-bold">JWT RBAC Enabled</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
