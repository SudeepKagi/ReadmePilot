import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, XCircle } from "lucide-react";

const OauthVerify = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying");
    const { login } = useAuth();

    useEffect(() => {
        const verifyToken = async () => {
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("accessToken");

            if (!accessToken) {
                setStatus("error");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            try {
                const result = await login(accessToken);
                if (result.success) {
                    setStatus("success");
                    setTimeout(() => navigate("/home"), 1500);
                } else {
                    setStatus("error");
                    setTimeout(() => navigate("/login"), 2000);
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        verifyToken();
    }, [navigate, login]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/70 to-white flex items-center justify-center p-4 selection:bg-blue-100">

            {/* bg blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="absolute bottom-24 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] p-10 text-center">

                    {status === "verifying" && (
                        <div className="space-y-5">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#1d4ed8] rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                                            <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                                                <path d="M4 5.5C4 4.4 4.9 3.5 6 3.5h8c1.1 0 2 .9 2 2V15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5.5z" stroke="#fff" strokeWidth="1.4" />
                                                <path d="M7 7.5h6M7 10.5h4M7 13.5h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">
                                    Authenticating
                                </p>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                                    Verifying...
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    Authenticating your GitHub account
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-5">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center shadow-[0_0_24px_-4px_rgba(29,78,216,0.2)]">
                                    <CheckCircle2 size={32} className="text-[#1d4ed8]" />
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">
                                    Authenticated
                                </p>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                                    Success!
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    Redirecting to your dashboard...
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <div className="h-1 w-24 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-[#1d4ed8] rounded-full animate-[grow_1.5s_ease-in-out_forwards]" style={{ width: '0%', animation: 'width 1.5s ease forwards' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-5">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center shadow-[0_0_24px_-4px_rgba(244,63,94,0.2)]">
                                    <XCircle size={32} className="text-rose-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">
                                    Failed
                                </p>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                                    Auth Failed
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    Redirecting back to login...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OauthVerify;