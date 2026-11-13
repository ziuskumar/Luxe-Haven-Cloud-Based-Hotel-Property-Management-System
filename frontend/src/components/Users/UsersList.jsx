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
      {/* Header Card */}
      <div className="card-plaster p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-voltage-lime text-midnight-ink">
              Admin Exclusive
            </span>
            <span className="text-xs font-bold text-slate-mute">System Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-ink tracking-tight font-display">
            Staff & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-mute mt-1">
            Manage system users, staff credentials, and dynamic permission roles across the PMS modules.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-black text-xs px-4 py-2 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Users Table Card */}
      <div className="card-plaster overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-ink"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bone-canvas text-slate-mute font-bold uppercase tracking-wider text-[11px] border-b border-cement-gray">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Assigned Role (RBAC)</th>
                  <th className="p-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cement-gray/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-bone-canvas/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-cement-gray"
                        />
                        <span className="font-bold text-midnight-ink">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-mute">{u.username}</td>
                    <td className="p-4 text-slate-mute">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-full border border-cement-gray bg-bone-canvas text-midnight-ink focus:outline-none focus:border-midnight-ink cursor-pointer transition capitalize"
                      >
                        <option value="admin">Admin</option>
                        <option value="hotel_manager">Hotel Manager</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-voltage-lime text-midnight-ink inline-block">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
