import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Github, ArrowLeft, Zap, Shield, RefreshCw } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = ({ user }) => {
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    if (user) return <Navigate to="/dashboard" replace />;

    const handleGitHubLogin = () => {
        window.location.href = `${BACKEND_URL}/auth/github`;
    };

    return (
        <div className="h-dvh mx-auto bg-white flex flex-col md:flex-row overflow-hidden relative selection:bg-blue-100 selection:text-white font-sans">

            {/* bg blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-100/20 rounded-full blur-[160px] pointer-events-none" />

            {/* top bar */}
            <div className="absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-center z-50 pointer-events-none">
                <a href="/" className="pointer-events-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="#fff" strokeWidth="1.4" />
                            <path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-900 text-sm tracking-tight">ReadmePilot</span>
                </a>
                <button
                    onClick={() => navigate("/")}
                    className="pointer-events-auto flex items-center gap-2 text-slate-400 hover:text-[#1d4ed8] transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            </div>

            {/* ── LEFT: login form ── */}
            <div className="w-full md:w-[45%] lg:w-[42%] h-full flex flex-col justify-center px-10 lg:px-20 bg-white relative">
                <div className="max-w-sm w-full animate-in fade-in slide-in-from-bottom-6 duration-700">

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1d4ed8]/10 text-[#1d4ed8] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-[#1d4ed8]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-pulse" />
                        Secure GitHub OAuth
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-none">
                        Ship docs<br />
                        <span className="text-[#1d4ed8]">automatically.</span>
                    </h1>
                    <p className="text-slate-500 mb-10 text-base leading-relaxed font-medium">
                        Connect your repos. Push code. ReadmePilot writes your README — every single time.
                    </p>

                    <button
                        onClick={handleGitHubLogin}
                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all duration-200 flex items-center justify-center gap-3 group shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 cursor-pointer"
                    >
                        <Github size={20} />
                        <span className="text-base tracking-tight">Continue with GitHub</span>
                    </button>

                    <p className="mt-6 text-[11px] text-slate-400 font-bold uppercase tracking-[0.22em] leading-relaxed">
                        Requires repo read & write access · AES-256 encrypted
                    </p>

                    {/* feature pills */}
                    <div className="mt-10 flex flex-col gap-3">
                        {[
                            { icon: <RefreshCw size={13} />, text: "README updated on every git push" },
                            { icon: <Zap size={13} />, text: "AI reads your actual code & config files" },
                            { icon: <Shield size={13} />, text: "Loop-safe · tokens encrypted at rest" },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1d4ed8] flex-shrink-0">
                                    {f.icon}
                                </div>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: social proof ── */}
            <div className="hidden md:flex flex-1 h-full bg-[#fafafa] relative items-center justify-center p-12 lg:p-20 overflow-hidden border-l border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:22px_22px] opacity-50" />

                <div className="relative z-10 max-w-md w-full animate-in fade-in zoom-in-95 duration-1000">
                    <div className="bg-white/80 backdrop-blur-md p-10 lg:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(29,78,216,0.08)] border border-slate-200 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-[#1d4ed8] rounded-b-full shadow-[0_0_16px_rgba(29,78,216,0.4)]" />

                        <div className="mb-8 flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live activity
                        </div>

                        <div className="space-y-3 mb-8">
                            {[
                                { repo: "Simon-Says", action: "README committed to main", time: "2m ago" },
                                { repo: "Stayora", action: "Health score 90/100 · 9 sections", time: "1h ago" },
                                { repo: "Fall-Detection", action: "Job queued by webhook push", time: "5d ago" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-[#1d4ed8] flex items-center justify-center font-black text-white text-[10px] flex-shrink-0">
                                            {item.repo[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-800 truncate">{item.repo}</div>
                                            <div className="text-[10px] text-slate-400 truncate">{item.action}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <blockquote className="text-xl lg:text-2xl font-black text-slate-900 leading-[1.2] tracking-tight mb-8">
                            "Finally, I can focus on building instead of writing docs."
                        </blockquote>

                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                            <img src="https://i.pravatar.cc/150?u=48" alt="" className="w-11 h-11 rounded-full border-2 border-[#1d4ed8]/10 shadow" />
                            <div>
                                <div className="font-black text-slate-900 text-sm">Alex Rivers</div>
                                <div className="text-xs text-[#1d4ed8] font-bold tracking-tight uppercase">Lead Engineer @ TechFlow</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center gap-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.28em] opacity-60">
                        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#1d4ed8]" /> AES-256</span>
                        <span className="text-slate-200">·</span>
                        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#1d4ed8]" /> OAuth 2.0</span>
                        <span className="text-slate-200">·</span>
                        <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#1d4ed8]" /> Loop-safe</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;