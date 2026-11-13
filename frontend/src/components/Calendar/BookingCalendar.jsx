import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import API from "../../api";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Key,
  LogOut,
  User,
  DollarSign,
  Tag,
  RefreshCw,
} from "lucide-react";

export default function BookingCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/calendar/events");
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo) => {
    const b = clickInfo.event.extendedProps;
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      ...b,
    });
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await API.post(`/bookings/${bookingId}/check-in`, {
        roomKeyNumber: `KEY-${selectedEvent.room?.roomNumber}`,
      });
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!window.confirm("Confirm check-out?")) return;
    try {
      await API.post(`/bookings/${bookingId}/check-out`);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            Interactive Reservation Calendar
            <span className="text-xs font-sans font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
              FullCalendar Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily, weekly, and monthly overview of room occupancy, upcoming arrivals, and checked-in guests
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Checked-In
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Checked-Out
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
            </span>
          </div>

          <button
            onClick={fetchEvents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main FullCalendar Component */}
      <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height={650}
          editable={false}
          selectable={true}
          dayMaxEvents={3}
        />
      </div>

      {/* Booking Details Modal on Event Click */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {selectedEvent.bookingNumber}
                </span>
                <h3 className="font-bold text-white text-lg mt-1 font-serif">
                  Room #{selectedEvent.room?.roomNumber} - {selectedEvent.room?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Guest Information</span>
                <p className="text-white font-semibold">{selectedEvent.guestDetails?.name}</p>
                <p className="text-slate-400">{selectedEvent.guestDetails?.email}</p>
                <p className="text-slate-400">{selectedEvent.guestDetails?.phone || "No phone provided"}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Stay Schedule</span>
                <p className="text-white font-semibold">
                  {new Date(selectedEvent.start).toLocaleDateString()} &rarr; {new Date(selectedEvent.end).toLocaleDateString()}
                </p>
                <p className="text-slate-400">{selectedEvent.nights} Night(s)</p>
                <p className="text-slate-400">Key: {selectedEvent.roomKeyNumber || "Not Issued"}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-white uppercase ml-2 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {selectedEvent.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-bold text-emerald-400 text-sm ml-2 font-mono">
                  ${selectedEvent.totalAmount}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              {selectedEvent.status === "confirmed" && (
                <button
                  onClick={() => handleCheckIn(selectedEvent.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Quick Check-In
                </button>
              )}

              {selectedEvent.status === "checked_in" && (
                <button
                  onClick={() => handleCheckOut(selectedEvent.id)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20"
                >
                  Quick Check-Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
