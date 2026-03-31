import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, XCircle, GitBranch, RefreshCw,
    Loader2, History,
} from "lucide-react";
import AuthNavigation from "../components/AuthNavigation";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { api } from "../lib/api";

const Logs = () => {
    useRequireAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const { data } = await api.get("/api/logs");
            setLogs(data.logs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const cfg = {
            success: { label: "Success", color: "text-[#1d4ed8]", bg: "bg-blue-50", border: "border-blue-100", icon: <CheckCircle2 size={13} /> },
            failed: { label: "Failed", color: "text-rose-600", bg: "bg-rose-50/80", border: "border-rose-100", icon: <XCircle size={13} /> },
            ongoing: { label: "Running", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100", icon: <Loader2 size={13} className="animate-spin" /> },
        };
        const s = cfg[status] || cfg.ongoing;
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border w-[118px] justify-center ${s.bg} ${s.border} ${s.color}`}>
                {s.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-sky-100">
            <AuthNavigation />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-24 left-[-7rem] h-72 w-72 rounded-full bg-blue-100/55 blur-3xl" />
                <div className="absolute top-72 right-[-8rem] h-96 w-96 rounded-full bg-sky-100/45 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-8 bg-[#1d4ed8] rounded-full" />
                            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity System</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 sm:text-5xl">Event Logs</h1>
                        <p className="mt-3 text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                            Every automated README run, tracked in real time
                        </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:rounded-[1.75rem]">
                        <button
                            onClick={() => fetchLogs(true)}
                            className="flex items-center gap-2.5 rounded-[1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#1e40af] active:scale-95 transition-all sm:rounded-[1.1rem]"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                            Refresh Feed
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {[
                        { label: "Total", val: logs.length, color: "text-slate-900", bg: "bg-white" },
                        { label: "Success", val: logs.filter(l => l.status === "success").length, color: "text-[#1d4ed8]", bg: "bg-blue-50/80" },
                        { label: "Failed", val: logs.filter(l => l.status === "failed").length, color: "text-rose-600", bg: "bg-rose-50/50" },
                        { label: "Running", val: logs.filter(l => l.status === "ongoing").length, color: "text-sky-700", bg: "bg-sky-50/80" },
                    ].map((s, i) => (
                        <div key={i} className={`rounded-[1.5rem] border border-slate-200/60 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5 ${s.bg}`}>
                            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">{s.label}</p>
                            <p className={`text-xl font-black sm:text-2xl ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Log container */}
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/85 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem]">
                    <div className="flex items-center gap-3 border-b border-dashed border-slate-200 bg-gradient-to-r from-blue-50/70 via-white to-transparent px-4 py-4 sm:px-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20 sm:h-10 sm:w-10">
                            <History size={17} />
                        </div>
                        <div>
                            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-slate-400">Live Timeline</p>
                            <p className="text-sm font-semibold text-slate-700">README automation activity</p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {loading && logs.length === 0 ? (
                            <div className="py-24 flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-[#1d4ed8]" size={36} />
                                <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-slate-400">Loading Logs</p>
                            </div>
                        ) : error ? (
                            <div className="px-6 py-14 text-center">
                                <XCircle size={40} className="mx-auto mb-4 text-rose-500" />
                                <h3 className="mb-2 text-base font-black uppercase tracking-tight text-slate-900">Failed to load logs</h3>
                                <p className="mb-6 text-sm text-slate-500">{error}</p>
                                <button onClick={() => fetchLogs(true)} className="rounded-full bg-[#1d4ed8] px-6 py-3 text-sm font-bold text-white hover:bg-[#1e40af]">
                                    Retry
                                </button>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <History size={44} className="mx-auto mb-4 text-blue-300" />
                                <h3 className="mb-2 text-base font-black uppercase tracking-tight text-slate-900">No activity yet</h3>
                                <p className="text-sm text-slate-500">Push to a connected repo to see logs appear here.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {logs.map((log, i) => (
                                    <LogItem key={log._id} log={log} index={i} StatusBadge={StatusBadge} />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LogItem = ({ log, index, StatusBadge }) => {
    const commitUrl = log.commitId && log.repoOwner
        ? `https://github.com/${log.repoOwner}/${log.repoName}/commit/${log.commitId}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="group"
        >
            <div
                className={`flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:p-5 ${commitUrl ? "cursor-pointer hover:bg-blue-50/40" : ""
                    }`}
                onClick={() => commitUrl && window.open(commitUrl, "_blank")}
            >
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`mt-0.5 rounded-2xl border p-2.5 transition-all ${log.status === "failed"
                            ? "bg-rose-50 border-rose-100 text-rose-500"
                            : "bg-blue-50 border-blue-100 text-[#1d4ed8] group-hover:bg-white"
                        }`}>
                        <GitBranch size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="mb-1 text-sm font-black uppercase tracking-tight text-slate-800">
                            {(log.action || "README Generation").replace(/_/g, " ")}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                                {log.repoOwner ? `${log.repoOwner}/${log.repoName}` : log.repoName}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-xs text-slate-400">{formatTimestamp(log.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="self-start sm:self-center">
                    <StatusBadge status={log.status} />
                </div>
            </div>
        </motion.div>
    );
};

const formatTimestamp = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default Logs;