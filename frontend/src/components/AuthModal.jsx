import React, { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";
import { LogIn, UserPlus, Sparkles, ShieldCheck } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, switchDemoRole } = useAuth();
  const [tab, setTab] = useState("login");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "login") {
      const res = await login(identifier, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    } else {
      const res = await register({ name, username, email, password, phone });
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  const handleDemoClick = async (roleKey) => {
    setError("");
    setLoading(true);
    const res = await switchDemoRole(roleKey);
    setLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold font-serif text-white">Luxe Haven Security</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-base">
            ✕
          </button>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant 1-Click Demo Sign-In:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoClick(key)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-white text-[11px]">{item.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-800 p-1 text-xs">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              tab === "login" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              tab === "register" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sophia Montgomery"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sophia_m"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sophia@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          )}

          {tab === "login" && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username or Email</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@luxehaven.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
          >
            {tab === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? "Authenticating..." : tab === "login" ? "Sign In" : "Register"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
