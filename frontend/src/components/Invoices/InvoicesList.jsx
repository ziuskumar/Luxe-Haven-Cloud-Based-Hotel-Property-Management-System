import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  Receipt,
  FileDown,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  RefreshCw,
  Printer,
} from "lucide-react";

export default function InvoicesList() {
  const { isStaff } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("paymentStatus", statusFilter);

      const res = await API.get(`/invoices?${params.toString()}`);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const downloadPDF = (invoiceId, invoiceNumber) => {
    window.open(`/api/invoices/${invoiceId}/download`, "_blank");
  };

  const recordPayment = async (invoiceId) => {
    try {
      await API.post(`/invoices/${invoiceId}/payment`, {
        paymentMethod: "card",
      });
      fetchInvoices();
    } catch (err) {
      alert("Failed to record payment.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
              Automated Billing & Sequential Tax Invoices
              <span className="text-xs font-sans font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                PDFKit Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sequential numbering, GST compliance (CGST/SGST), and downloadable PDF receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice # or guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={fetchInvoices}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Invoices"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-700/60">
          <span className="text-slate-400">Payment Status:</span>
          {["all", "paid", "pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full capitalize transition font-medium ${
                statusFilter === st
                  ? "bg-sky-600 text-white font-semibold shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800/50 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No invoices found. Generate a booking to automatically issue a sequential GST tax invoice!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Guest & Room</th>
                  <th className="p-3.5">Subtotal</th>
                  <th className="p-3.5">GST Tax (18%)</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {invoices.map((inv) => {
                  const isPaid = inv.paymentStatus === "paid";
                  return (
                    <tr key={inv._id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5 font-bold font-mono text-sky-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{inv.guestName}</div>
                        <div className="text-[11px] text-slate-400">
                          Room #{inv.room?.roomNumber || "N/A"} ({inv.room?.category || "Standard"})
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">
                        ${inv.subtotal}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        ${inv.totalTax} (9%+9%)
                      </td>
                      <td className="p-3.5 font-bold font-mono text-white text-sm">
                        ${inv.grandTotal}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase ${
                            isPaid
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadPDF(inv._id, inv.invoiceNumber)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-600 text-white font-medium text-xs shadow transition"
                            title="Download PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          {isStaff && !isPaid && (
                            <button
                              onClick={() => recordPayment(inv._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-medium text-xs transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
