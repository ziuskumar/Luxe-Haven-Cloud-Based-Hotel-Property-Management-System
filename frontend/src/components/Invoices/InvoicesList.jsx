import React, { useState, useEffect } from "react";
import API from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  FileDown,
  Search,
  RefreshCw,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
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
      {/* Header & Controls Card */}
      <div className="card-plaster p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-voltage-lime text-midnight-ink">
                PDFKit Engine
              </span>
              <span className="text-xs font-bold text-slate-mute">Sequential Tax Billing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-ink tracking-tight font-display">
              Tax Invoices & Financial Records
            </h1>
            <p className="text-xs text-slate-mute mt-1">
              Compliant sequential numbering, 18% GST (CGST/SGST), and downloadable vector PDF receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-mute" />
              <input
                type="text"
                placeholder="Search invoice # or guest name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
                className="w-full bg-bone-canvas border border-cement-gray rounded-input pl-9 pr-3.5 py-2 text-xs text-midnight-ink placeholder-slate-mute focus:outline-none focus:border-midnight-ink font-medium"
              />
            </div>

            <button
              onClick={fetchInvoices}
              className="p-2.5 rounded-full bg-bone-canvas hover:bg-cement-gray text-midnight-ink border border-cement-gray transition font-bold"
              title="Refresh Invoices"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 text-xs pt-3 border-t border-cement-gray">
          <span className="text-slate-mute font-bold text-[11px] uppercase tracking-wider">Payment Status:</span>
          {["all", "paid", "pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full capitalize transition font-bold text-xs ${
                statusFilter === st
                  ? "bg-midnight-ink text-plaster-white"
                  : "bg-bone-canvas text-slate-mute hover:bg-cement-gray hover:text-midnight-ink"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="card-plaster overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-ink"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center text-slate-mute text-xs">
            No invoices found. Generate a booking to automatically issue a sequential GST tax invoice!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bone-canvas text-slate-mute font-bold uppercase tracking-wider text-[11px] border-b border-cement-gray">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Guest & Room</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">GST (18%)</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cement-gray/60 font-medium">
                {invoices.map((inv) => {
                  const isPaid = inv.paymentStatus === "paid";
                  return (
                    <tr key={inv._id} className="hover:bg-bone-canvas/60 transition">
                      <td className="p-4 font-mono font-bold text-midnight-ink">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 text-slate-mute font-medium">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-midnight-ink">{inv.guestName}</div>
                        <div className="text-[11px] text-slate-mute">
                          Room #{inv.room?.roomNumber || "N/A"} ({inv.room?.category || "Standard"})
                        </div>
                      </td>
                      <td className="p-4 text-slate-mute font-mono">
                        ${inv.subtotal}
                      </td>
                      <td className="p-4 text-slate-mute font-mono text-[11px]">
                        ${inv.totalTax} (9%+9%)
                      </td>
                      <td className="p-4 font-black font-mono text-midnight-ink text-sm">
                        ${inv.grandTotal}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            isPaid
                              ? "bg-voltage-lime text-midnight-ink"
                              : "bg-saffron text-midnight-ink"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadPDF(inv._id, inv.invoiceNumber)}
                            className="btn-lime text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                            title="Download Vector PDF Invoice"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          {isStaff && !isPaid && (
                            <button
                              onClick={() => recordPayment(inv._id)}
                              className="btn-black text-xs px-3 py-1.5"
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
