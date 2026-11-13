import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import API from "../api";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastAlert, setToastAlert] = useState(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const newSocket = io({
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      // Join role room
      if (user.role) {
        newSocket.emit("join", `role:${user.role}`);
      }
      if (user._id) {
        newSocket.emit("join", `user:${user._id}`);
      }
    });

    const handleNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      // Trigger toast alert
      setToastAlert(notif);
      setTimeout(() => setToastAlert(null), 5000);
    };

    newSocket.on("notification", handleNotification);
    newSocket.on("role_notification", handleNotification);
    newSocket.on("user_notification", handleNotification);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, user?.role]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        toastAlert,
        setToastAlert,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
