import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthNavigation from "../components/AuthNavigation";
import {
    Loader2,
    Github,
    AlertCircle,
    RefreshCw,
    Search,
    X,
    GitBranch,
    ExternalLink,
    Zap,
} from "lucide-react";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useRepos } from "../hooks/useRepos";
import api from "../lib/api";

const FILTER_TABS = [
    { key: "all", label: "All Repos" },
    { key: "connected", label: "Connected" },
    { key: "inactive", label: "Not Connected" },
];

const Home = () => {
    const navigate = useNavigate();
    const { user } = useRequireAuth();
    const { repos, setRepos, loading, error, fetchRepos } = useRepos(user);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [connecting, setConnecting] = useState({});

    const handleConnect = async (repo) => {
        setConnecting((prev) => ({ ...prev, [repo.id]: true }));
        try {
            await api.post(`/api/repos/${repo.id}/connect`, {
                fullName: repo.full_name,
                defaultBranch: repo.default_branch || "main",
            });
            await fetchRepos();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to connect");
        } finally {
            setConnecting((prev) => ({ ...prev, [repo.id]: false }));
        }
    };

    const filteredRepos = repos.filter((repo) => {
        let matchesFilter = true;
        if (filter === "connected") matchesFilter = repo.activated;
        if (filter === "inactive") matchesFilter = !repo.activated;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            repo.name?.toLowerCase().includes(q) ||
            repo.full_name?.toLowerCase().includes(q);

        return matchesFilter && matchesSearch;
    });

    const connectedCount = repos.filter((r) => r.activated).length;
    const privateCount = repos.filter((r) => r.private).length;
    const avgHealth = connectedCount
        ? Math.round(
            repos
                .filter((r) => r.activated && r.healthScore)
                .reduce((a, r) => a + (r.healthScore || 0), 0) / connectedCount
        )
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
            <AuthNavigation />

            {/* bg blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="absolute top-52 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
            </div>

            <div className="relative px-4 pb-14 pt-22 sm:px-6 sm:pb-16 sm:pt-24">
                <div className="max-w-7xl mx-auto">

                    {/* ── Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mb-10"
                    >
                        <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-1 w-8 rounded-full bg-[#1d4ed8]" />
                                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                        Repository System
                                    </span>
                                </div>
                                <h1 className="mb-3 text-3xl font-black uppercase leading-none tracking-tighter text-slate-900 sm:text-5xl">
                                    Repositories
                                </h1>
                                <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                                    Connect repos to enable AI-powered README auto-generation on every push
                                </p>
                            </div>
                            <div className="w-full rounded-[1.5rem] border border-slate-200 bg-white/80 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:w-auto sm:rounded-[1.75rem]">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={fetchRepos}
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1d4ed8] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af] disabled:opacity-50 sm:w-auto sm:rounded-[1.1rem] sm:px-5"
                                >
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    Refresh list
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                            <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5">
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">Total</p>
                                <p className="text-xl font-black text-slate-900 sm:text-2xl">{repos.length}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(29,78,216,0.22)] sm:rounded-[2rem] sm:p-5">
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">Connected</p>
                                <p className="text-xl font-black text-[#1d4ed8] sm:text-2xl">{connectedCount}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-slate-200/60 bg-slate-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-5">
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">Avg Health</p>
                                <p className="text-xl font-black text-slate-600 sm:text-2xl">{avgHealth || "—"}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(14,165,233,0.2)] sm:rounded-[2rem] sm:p-5">
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">Private</p>
                                <p className="text-xl font-black text-sky-600 sm:text-2xl">{privateCount}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Filter + Search ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white/75 p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:flex-row sm:items-center sm:rounded-[2rem] sm:p-4"
                    >
                        <div className="-mx-1 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
                            {FILTER_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition-all sm:px-4 ${filter === tab.key
                                            ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20"
                                            : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full flex-1 sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search repositories..."
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X size={16} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* ── Content ── */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={40} className="text-[#1d4ed8] animate-spin mb-4" />
                            <p className="text-slate-500 font-medium text-sm">Loading your repositories...</p>
                        </div>
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-rose-200 rounded-[2rem] p-8 text-center shadow-[0_16px_40px_-30px_rgba(244,63,94,0.35)]"
                        >
                            <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Failed to load</h3>
                            <p className="text-rose-700 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchRepos}
                                className="bg-[#1d4ed8] text-white px-6 py-3 rounded-full font-bold hover:bg-[#1e40af] transition-all text-sm"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    ) : filteredRepos.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredRepos.map((repo, index) => (
                                <motion.div
                                    key={repo.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                                >
                                    <RepoCard
                                        repo={repo}
                                        onConnect={handleConnect}
                                        connecting={connecting[repo.id]}
                                        onPreview={() => navigate(`/repo/${repo._id || repo.id}`)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 border border-dashed border-slate-300 rounded-[2rem] p-12 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]"
                        >
                            <Github size={56} className="text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">
                                No repositories found
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {filter === "connected"
                                    ? "No repos connected yet. Hit Connect on any repo below."
                                    : "No repos match your search."}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Repo Card ── */
const RepoCard = ({ repo, onConnect, connecting, onPreview }) => {
    const isConnected = repo.activated;
    const healthColor =
        repo.healthScore >= 70
            ? "text-green-600"
            : repo.healthScore >= 40
                ? "text-amber-600"
                : "text-rose-600";
    const healthBg =
        repo.healthScore >= 70
            ? "bg-green-50 border-green-100"
            : repo.healthScore >= 40
                ? "bg-amber-50 border-amber-100"
                : "bg-rose-50 border-rose-100";

    return (
        <div
            className={`group relative flex flex-col rounded-[1.75rem] border bg-white/90 p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] transition-all duration-200 hover:shadow-[0_20px_50px_-28px_rgba(15,23,42,0.38)] hover:-translate-y-0.5 ${isConnected
                    ? "border-blue-100 cursor-pointer"
                    : "border-slate-200/60 cursor-default"
                }`}
            onClick={isConnected ? onPreview : undefined}
        >
            {/* top row */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 ${isConnected ? "bg-[#1d4ed8] text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                        {repo.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="font-black text-sm tracking-tight text-slate-900 truncate">{repo.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{repo.full_name}</div>
                    </div>
                </div>

                {isConnected && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-100 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-700">live</span>
                    </div>
                )}
            </div>

            {/* description */}
            {repo.description && (
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{repo.description}</p>
            )}

            {/* meta */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mb-4">
                {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />{repo.language}</span>}
                <span>⭐ {repo.stargazers_count || repo.stars || 0}</span>
                {repo.private && <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Private</span>}
            </div>

            {/* connected stats */}
            {isConnected && (repo.healthScore > 0 || repo.lastGeneratedAt) && (
                <div className="flex items-center gap-3 mb-4">
                    {repo.healthScore > 0 && (
                        <span className={`text-[10px] font-black font-mono px-2 py-1 rounded-full border ${healthBg} ${healthColor}`}>
                            Health {repo.healthScore}/100
                        </span>
                    )}
                    {repo.lastGeneratedAt && (
                        <span className="text-[10px] text-slate-400 font-mono">
                            {formatRelativeTime(repo.lastGeneratedAt)}
                        </span>
                    )}
                </div>
            )}

            {/* action */}
            <div className="mt-auto pt-3 border-t border-slate-100">
                {isConnected ? (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                            Click to view README
                        </span>
                        <ExternalLink size={13} className="text-slate-300 group-hover:text-[#1d4ed8] transition-colors" />
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onConnect(repo); }}
                        disabled={connecting}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1d4ed8] py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#1e40af] transition-all disabled:opacity-60"
                    >
                        {connecting ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Zap size={13} />
                        )}
                        {connecting ? "Connecting..." : "Connect"}
                    </button>
                )}
            </div>
        </div>
    );
};

const formatRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

export default Home;