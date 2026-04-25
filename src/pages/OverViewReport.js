import React, { useContext, useEffect, useState, useCallback } from "react";
import AuthContext from "../AuthContext";
import GlobalApiState from "../utilis/globalVariable";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
} from "recharts";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(n ?? 0);

const num = (n) => Number(n ?? 0).toLocaleString();

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
};

// ─── sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = "blue" }) {
    const colors = {
        blue: "border-blue-500 bg-blue-50 text-blue-700",
        green: "border-green-500 bg-green-50 text-green-700",
        red: "border-red-500 bg-red-50 text-red-700",
        yellow: "border-yellow-500 bg-yellow-50 text-yellow-700",
        purple: "border-purple-500 bg-purple-50 text-purple-700",
    };
    return (
        <div className={`rounded-lg border-l-4 p-4 shadow-sm bg-white ${colors[color]}`}>
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${colors[color].split(" ").pop()}`}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function SectionTitle({ children }) {
    return (
        <h2 className="pb-2 mb-4 text-base font-bold text-gray-800 border-b">{children}</h2>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-700 rounded-full animate-spin" />
        </div>
    );
}

function EmptyState({ msg = "No data found" }) {
    return (
        <p className="py-8 font-medium text-center text-blue-600">{msg}</p>
    );
}

// custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-4 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
            <p className="mb-1 font-bold text-gray-700">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: <span className="font-semibold">{p.name.toLowerCase().includes("revenue") || p.name.toLowerCase().includes("pkr") ? fmt(p.value) : num(p.value)}</span>
                </p>
            ))}
        </div>
    );
};

// ─── tabs ─────────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Sales", "Stock", "Buyers"];

// ─── main component ───────────────────────────────────────────────────────────

export default function OverViewReport() {
    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;

    const [activeTab, setActiveTab] = useState("Overview");
    const [from, setFrom] = useState(monthStart());
    const [to, setTo] = useState(today());

    const [summary, setSummary] = useState(null);
    const [stockRows, setStockRows] = useState([]);
    const [salesRows, setSalesRows] = useState([]);
    const [salesMeta, setSalesMeta] = useState({ total: 0, page: 1, pages: 1 });

    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingStock, setLoadingStock] = useState(false);
    const [loadingSales, setLoadingSales] = useState(false);

    const [stockSearch, setStockSearch] = useState("");
    const [salesPage, setSalesPage] = useState(1);

    // ── fetch summary ────────────────────────────────────────────────────────
    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const res = await fetch(
                `${GlobalApiState.DEV_BASE_LIVE}/api/overview-report/summary/${userId}?from=${from}&to=${to}`
            );
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSummary(false);
        }
    }, [userId, from, to]);

    // ── fetch stock ──────────────────────────────────────────────────────────
    const fetchStock = useCallback(async () => {
        setLoadingStock(true);
        try {
            const res = await fetch(
                `${GlobalApiState.DEV_BASE_LIVE}/api/overview-report/stock/${userId}`
            );
            const data = await res.json();
            setStockRows(data.designs ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStock(false);
        }
    }, [userId]);

    // ── fetch sales ──────────────────────────────────────────────────────────
    const fetchSales = useCallback(async () => {
        setLoadingSales(true);
        try {
            const res = await fetch(
                `${GlobalApiState.DEV_BASE_LIVE}/api/overview-report/sales/${userId}?from=${from}&to=${to}&page=${salesPage}&limit=15`
            );
            const data = await res.json();
            setSalesRows(data.sales ?? []);
            setSalesMeta({ total: data.total, page: data.page, pages: data.pages });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSales(false);
        }
    }, [userId, from, to, salesPage]);

    // ── effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId) {
            fetchSummary();
            fetchStock();
        }
    }, [fetchSummary, fetchStock]);

    useEffect(() => {
        if (userId && activeTab === "Sales") fetchSales();
    }, [fetchSales, activeTab]);

    const handleApplyFilter = () => {
        setSalesPage(1);
        fetchSummary();
        if (activeTab === "Sales") fetchSales();
    };

    // ── filtered stock ───────────────────────────────────────────────────────
    const filteredStock = stockRows.filter(
        (r) =>
            r.designNumber.toLowerCase().includes(stockSearch.toLowerCase()) ||
            r.catalogue.toLowerCase().includes(stockSearch.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex justify-center col-span-12 px-2 lg:col-span-10 sm:px-4">
            <div className="flex flex-col w-full gap-5 lg:w-11/12">

                {/* ── Header ── */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>

                    {/* Date filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                            <label>From</label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="px-2 py-1 text-xs border rounded outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                            <label>To</label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="px-2 py-1 text-xs border rounded outline-none focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleApplyFilter}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 border-b border-gray-200">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════════════════ */}
                {activeTab === "Overview" && (
                    <div className="flex flex-col gap-6">
                        {loadingSummary ? (
                            <Spinner />
                        ) : (
                            <>
                                {/* KPI grid */}
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                    <KpiCard label="Total Revenue" value={fmt(summary?.sales?.totalRevenue)} color="green" />
                                    <KpiCard label="Invoices Issued" value={num(summary?.sales?.totalInvoices)} color="blue" />
                                    <KpiCard label="Khazana Sold" value={num(summary?.sales?.totalKhazanaSold)} sub="pieces" color="purple" />
                                    <KpiCard label="Delivery Charges" value={fmt(summary?.sales?.totalDelivery)} color="yellow" />
                                    <KpiCard label="Pending Amount" value={fmt(summary?.buyers?.totalPending)} color="red" />
                                    <KpiCard label="Total Received" value={fmt(summary?.buyers?.totalReceived)} color="green" />
                                    <KpiCard label="Khazana In Stock" value={num(summary?.stock?.totalKhazanaInStock)} color="blue" />
                                    <KpiCard label="Total Designs" value={num(summary?.stock?.totalDesigns)} color="purple" />
                                </div>

                                {/* Daily revenue chart */}
                                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <SectionTitle>Daily Revenue</SectionTitle>
                                    {summary?.sales?.dailyBreakdown?.length ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <AreaChart data={summary.sales.dailyBreakdown}>
                                                <defs>
                                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="revenue" name="Revenue (PKR)" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState msg="No sales data in this period" />
                                    )}
                                </div>

                                {/* Per-catalogue stock bar chart */}
                                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <SectionTitle>Stock by Catalogue</SectionTitle>
                                    {summary?.stock?.byCatalogue?.length ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={summary.stock.byCatalogue}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="catalogue" tick={{ fontSize: 10 }} />
                                                <YAxis tick={{ fontSize: 10 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                                <Bar dataKey="totalKhazana" name="Khazana In Stock" fill="#2563eb" radius={[3, 3, 0, 0]} />
                                                <Bar dataKey="totalSold" name="Sold" fill="#16a34a" radius={[3, 3, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState msg="No catalogue data found" />
                                    )}
                                </div>

                            </>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
            TAB: SALES
        ══════════════════════════════════════════════════════════════════ */}
                {activeTab === "Sales" && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <SectionTitle>Sales Invoices</SectionTitle>
                            <span className="text-xs text-gray-500">{num(salesMeta.total)} total records</span>
                        </div>
                        {loadingSales ? (
                            <Spinner />
                        ) : salesRows.length === 0 ? (
                            <EmptyState msg="No sales found in this period" />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                {["Invoice #", "Buyer", "Phone", "Grand Total", "Delivery", "Paid", "Date"].map((h) => (
                                                    <th key={h} className="px-4 py-2 font-bold text-left text-gray-700 whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {salesRows.map((s) => (
                                                <tr key={s._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-bold text-blue-600">#{s.inVoice}</td>
                                                    <td className="px-4 py-2 font-semibold text-gray-800">
                                                        {typeof s.buyer === "object" ? s.buyer?.label ?? "—" : s.buyer}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500">
                                                        {typeof s.buyer_phone === "object" ? s.buyer_phone?.number ?? "—" : s.buyer_phone ?? "—"}
                                                    </td>                                                    <td className="px-4 py-2 font-bold text-green-700">{fmt(s.grandTotal)}</td>
                                                    <td className="px-4 py-2 text-gray-600">{fmt(s.deliveryCharges)}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                            {s.paid ? "Paid" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500">{new Date(s.createdAt).toLocaleDateString("en-PK")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4 text-xs">
                                    <span className="text-gray-500">
                                        Page {salesMeta.page} of {salesMeta.pages}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={salesMeta.page <= 1}
                                            onClick={() => setSalesPage((p) => p - 1)}
                                            className="px-3 py-1 font-semibold border rounded disabled:opacity-40 hover:bg-gray-100"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={salesMeta.page >= salesMeta.pages}
                                            onClick={() => setSalesPage((p) => p + 1)}
                                            className="px-3 py-1 font-semibold border rounded disabled:opacity-40 hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
            TAB: STOCK
        ══════════════════════════════════════════════════════════════════ */}
                {activeTab === "Stock" && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                            <SectionTitle>Stock Report</SectionTitle>
                            <div className="flex items-center w-48 px-2 border-2 rounded-md">
                                <img alt="search" className="w-4 h-4" src={require("../assets/search-icon.png")} />
                                <input
                                    className="w-full ml-1 text-xs border-none outline-none"
                                    type="text"
                                    placeholder="Search design / catalogue"
                                    value={stockSearch}
                                    onChange={(e) => setStockSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingStock ? (
                            <Spinner />
                        ) : filteredStock.length === 0 ? (
                            <EmptyState msg="No designs found" />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            {["Catalogue", "Design #", "Stock", "Khazana Stock", "Sell Stock", "Cost Price", "Price"].map((h) => (
                                                <th key={h} className="whitespace-nowrap px-4 py-2 text-left font-bold text-gray-700 lg:text-[14px] text-[12px]">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStock.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-semibold text-gray-800 whitespace-nowrap">{d.catalogue}</td>
                                                <td className="px-4 py-2 font-bold text-blue-600 whitespace-nowrap">{d.designNumber}</td>
                                                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{num(d.stock)}</td>
                                                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{num(d.khazanaStock)}</td>
                                                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{num(d.sellStock)}</td>
                                                <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{fmt(d.costPrice)}</td>
                                                <td className="px-4 py-2 font-bold text-green-700 whitespace-nowrap">{fmt(d.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
            TAB: BUYERS
        ══════════════════════════════════════════════════════════════════ */}
                {activeTab === "Buyers" && (
                    <div className="flex flex-col gap-6">
                        {loadingSummary ? (
                            <Spinner />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <KpiCard label="Total Buyers" value={num(summary?.buyers?.totalBuyers)} color="blue" />
                                    <KpiCard label="Total Billed" value={fmt(summary?.buyers?.totalBillIssued)} color="purple" />
                                    <KpiCard label="Total Received" value={fmt(summary?.buyers?.totalReceived)} color="green" />
                                    <KpiCard label="Total Pending" value={fmt(summary?.buyers?.totalPending)} color="red" />
                                </div>

                                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <SectionTitle>Top Buyers by Revenue</SectionTitle>
                                    {summary?.buyers?.topBuyers?.length ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={summary.buyers.topBuyers} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                                <YAxis type="category" dataKey="buyer" tick={{ fontSize: 10 }} width={80} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="totalSpent" name="Revenue (PKR)" fill="#2563eb" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState msg="No buyer data in this period" />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}