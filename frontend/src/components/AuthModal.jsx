import React, { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";
import { LogIn, UserPlus, Sparkles, ShieldCheck, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-midnight-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-plaster max-w-md w-full p-6 sm:p-8 space-y-5 border border-cement-gray animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cement-gray pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-voltage-lime flex items-center justify-center text-midnight-ink">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-midnight-ink font-display tracking-tight">
                Luxe Haven Identity
              </h2>
              <span className="text-[10px] uppercase font-bold text-slate-mute tracking-wider">
                RBAC Multi-Role Access
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="bg-bone-canvas p-4 rounded-[24px] border border-cement-gray space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-midnight-ink">
            <Sparkles className="w-3.5 h-3.5 text-cobalt-signal" />
            <span>Instant 1-Click Role Switcher:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDemoClick(key)}
                className="p-2.5 rounded-input bg-plaster-white border border-cement-gray hover:border-midnight-ink text-midnight-ink text-left transition"
              >
                <div className="font-bold text-[11px] text-midnight-ink">{item.label}</div>
                <div className="text-[10px] text-slate-mute truncate">{item.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-full bg-bone-canvas p-1 text-xs border border-cement-gray">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-full font-bold transition text-xs ${
              tab === "login"
                ? "bg-midnight-ink text-plaster-white"
                : "text-slate-mute hover:text-midnight-ink"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded-full font-bold transition text-xs ${
              tab === "register"
                ? "bg-midnight-ink text-plaster-white"
                : "text-slate-mute hover:text-midnight-ink"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-input bg-bordeaux-maroon/10 border border-bordeaux-maroon/20 text-bordeaux-maroon text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-midnight-ink font-bold mb-1 text-[11px] uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sophia Montgomery"
                  className="w-full bg-bone-canvas border border-cement-gray rounded-input p-3 text-midnight-ink focus:outline-none focus:border-midnight-ink font-medium"
                />
              </div>

              <div>
                <label className="block text-midnight-ink font-bold mb-1 text-[11px] uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sophia_m"
                  className="w-full bg-bone-canvas border border-cement-gray rounded-input p-3 text-midnight-ink focus:outline-none focus:border-midnight-ink font-medium"
                />
              </div>

              <div>
                <label className="block text-midnight-ink font-bold mb-1 text-[11px] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sophia@example.com"
                  className="w-full bg-bone-canvas border border-cement-gray rounded-input p-3 text-midnight-ink focus:outline-none focus:border-midnight-ink font-medium"
                />
              </div>
            </>
          )}

          {tab === "login" && (
            <div>
              <label className="block text-midnight-ink font-bold mb-1 text-[11px] uppercase tracking-wider">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@luxehaven.com"
                className="w-full bg-bone-canvas border border-cement-gray rounded-input p-3 text-midnight-ink focus:outline-none focus:border-midnight-ink font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-midnight-ink font-bold mb-1 text-[11px] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-bone-canvas border border-cement-gray rounded-input p-3 text-midnight-ink focus:outline-none focus:border-midnight-ink font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-lime w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            {tab === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? "Authenticating..." : tab === "login" ? "Sign In" : "Register"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
