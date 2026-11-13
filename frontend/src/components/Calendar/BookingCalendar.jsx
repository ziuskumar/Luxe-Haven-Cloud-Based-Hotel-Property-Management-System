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
  X,
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
    if (!window.confirm("Confirm check-out? Room will be set to dirty for housekeeping.")) return;
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
      {/* Calendar Header Card */}
      <div className="card-plaster p-6 sm:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-voltage-lime text-midnight-ink">
                FullCalendar v6
              </span>
              <span className="text-xs font-bold text-slate-mute">Dynamic Occupancy Grid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-ink tracking-tight font-display">
              Interactive Reservation Calendar
            </h1>
            <p className="text-xs text-slate-mute mt-1">
              Daily, weekly, and monthly view of guest arrivals, active stays, and room turnovers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Color Legend */}
            <div className="flex items-center gap-2 text-[11px] bg-bone-canvas px-3.5 py-1.5 rounded-full border border-cement-gray font-bold">
              <span className="flex items-center gap-1.5 text-midnight-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-depth"></span> Confirmed
              </span>
              <span className="flex items-center gap-1.5 text-midnight-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-cobalt-signal"></span> Checked-In
              </span>
              <span className="flex items-center gap-1.5 text-midnight-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-mute"></span> Checked-Out
              </span>
              <span className="flex items-center gap-1.5 text-midnight-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-saffron"></span> Pending
              </span>
            </div>

            <button
              onClick={fetchEvents}
              className="btn-black text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main FullCalendar Card */}
      <div className="card-plaster p-6 sm:p-8 overflow-hidden">
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
        <div className="fixed inset-0 z-50 bg-midnight-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-plaster max-w-lg w-full p-6 sm:p-8 space-y-5 border border-cement-gray animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-cement-gray pb-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase bg-bone-canvas text-slate-mute px-2.5 py-1 rounded-full border border-cement-gray">
                  {selectedEvent.bookingNumber}
                </span>
                <h3 className="text-xl font-black text-midnight-ink mt-2 font-display">
                  Room #{selectedEvent.room?.roomNumber} - {selectedEvent.room?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-input bg-bone-canvas border border-cement-gray space-y-1">
                <span className="text-slate-mute text-[10px] uppercase font-black tracking-wider">
                  Guest Information
                </span>
                <p className="text-midnight-ink font-bold text-sm">{selectedEvent.guestDetails?.name}</p>
                <p className="text-slate-mute truncate">{selectedEvent.guestDetails?.email}</p>
                <p className="text-slate-mute">{selectedEvent.guestDetails?.phone || "No phone provided"}</p>
              </div>

              <div className="p-4 rounded-input bg-bone-canvas border border-cement-gray space-y-1">
                <span className="text-slate-mute text-[10px] uppercase font-black tracking-wider">
                  Stay Schedule
                </span>
                <p className="text-midnight-ink font-bold">
                  {new Date(selectedEvent.start).toLocaleDateString()} &rarr; {new Date(selectedEvent.end).toLocaleDateString()}
                </p>
                <p className="text-slate-mute font-medium">{selectedEvent.nights} Night(s)</p>
                <p className="text-midnight-ink font-mono font-semibold">Key: {selectedEvent.roomKeyNumber || "Not Issued"}</p>
              </div>
            </div>

            <div className="p-4 rounded-input bg-bone-canvas border border-cement-gray flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-mute font-bold uppercase text-[10px] block">Status</span>
                <span className="font-black text-midnight-ink uppercase px-2.5 py-0.5 rounded-full bg-voltage-lime text-[11px] inline-block mt-0.5">
                  {selectedEvent.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-mute font-bold uppercase text-[10px] block">Total Charged</span>
                <span className="font-black text-midnight-ink text-lg font-mono">
                  ${selectedEvent.totalAmount}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-cement-gray">
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn-ghost text-xs px-4 py-2"
              >
                Close
              </button>

              {selectedEvent.status === "confirmed" && (
                <button
                  onClick={() => handleCheckIn(selectedEvent.id)}
                  className="btn-lime text-xs px-5 py-2"
                >
                  Quick Check-In
                </button>
              )}

              {selectedEvent.status === "checked_in" && (
                <button
                  onClick={() => handleCheckOut(selectedEvent.id)}
                  className="btn-black text-xs px-5 py-2"
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
