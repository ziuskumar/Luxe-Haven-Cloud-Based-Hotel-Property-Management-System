import React, { useState, useEffect } from "react";
import API from "../../api";
import { Users, Shield, UserCheck, RefreshCw, Sparkles } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/auth/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            Staff & Role-Based Access Control (RBAC)
            <span className="text-xs font-sans font-semibold bg-purple-950 text-purple-400 border border-purple-800 px-2.5 py-0.5 rounded-full">
              Admin Exclusive
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage system users, staff credentials, and dynamic permission roles across the PMS
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Assigned Role (RBAC)</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{u.username}</td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${
                        u.role === "admin"
                          ? "bg-purple-950 text-purple-300 border-purple-800"
                          : u.role === "hotel_manager"
                          ? "bg-sky-950 text-sky-300 border-sky-800"
                          : u.role === "receptionist"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      <option value="admin" className="bg-slate-900 text-purple-300">Admin</option>
                      <option value="hotel_manager" className="bg-slate-900 text-sky-300">Hotel Manager</option>
                      <option value="receptionist" className="bg-slate-900 text-emerald-300">Receptionist</option>
                      <option value="customer" className="bg-slate-900 text-slate-300">Customer</option>
                    </select>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Active
                    </span>
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
