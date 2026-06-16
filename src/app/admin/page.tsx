"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ERA_CONFIG, type Idea } from "@/lib/ideas";
import { cn } from "@/lib/utils";

// Allowed email administrators
const ALLOWED_ADMINS = [
  "sourabhsinghtak.2207@gmail.com",
  "gehlotgarvit2005@gmail.com",
];

// Activity inactivity timeout (15 minutes in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  target: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  team_name: string;
  idea_title: string;
  idea_description: string;
  restricted: boolean;
  restriction_reason: string;
  created_at: string;
  last_sign_in_at: string;
}

export default function AdminPortal() {
  // Authentication & Session
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "ideas" | "users" | "trash" | "logs">("overview");

  // Dashboard Data
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [trashIdeas, setTrashIdeas] = useState<Idea[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [dbWarning, setDbWarning] = useState(false);

  // States for Modals/Actions
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // Search, Filters & Sorting
  const [ideaSearch, setIdeaSearch] = useState("");
  const [ideaEraFilter, setIdeaEraFilter] = useState<string>("all");
  const [ideaStatusFilter, setIdeaStatusFilter] = useState<string>("all");
  const [ideaSort, setIdeaSort] = useState<string>("created_at_desc");

  const [userSearch, setUserSearch] = useState("");

  // Admin Review Notes/Status form
  const [reviewStatus, setReviewStatus] = useState<string>("Pending");
  const [reviewNotes, setReviewNotes] = useState<string>("");

  // Inactivity tracking
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // User restriction modal state
  const [restrictingUser, setRestrictingUser] = useState<AdminUser | null>(null);
  const [restrictionReason, setRestrictionReason] = useState("");

  // Dark/Light Cyberpunk Mode state
  const [lightMode, setLightMode] = useState(false);

  // 1. Check current session status on mount
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session?.access_token) {
        const userEmail = session.user.email?.toLowerCase() || "";
        if (ALLOWED_ADMINS.includes(userEmail)) {
          setSessionUser(session.user);
          setSessionToken(session.access_token);
          setIsAdmin(true);
        } else {
          // Force sign out unauthorized emails
          await supabase.auth.signOut();
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkSession();

    // Listen for auth state alterations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase() || "";
        if (ALLOWED_ADMINS.includes(userEmail)) {
          setSessionUser(session.user);
          setSessionToken(session.access_token || "");
          setIsAdmin(true);
        } else {
          await supabase.auth.signOut();
          setIsAdmin(false);
          setLoginError("Access denied: You are not an authorized administrator.");
        }
      } else {
        setSessionUser(null);
        setSessionToken("");
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch data utility
  const adminFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      if (!sessionToken) {
        return new Response(JSON.stringify({ error: "Unauthorized: No session token." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
          ...options?.headers,
        },
      });
    },
    [sessionToken]
  );

  // 3. Load data for active dashboard components
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // Fetch Active Ideas
      const ideasRes = await adminFetch("/api/admin/ideas?trash=false");
      if (ideasRes && ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setIdeas(ideasData.ideas ?? []);
        if (ideasData.warning) setDbWarning(true);
      }

      // Fetch Trash Ideas
      const trashRes = await adminFetch("/api/admin/ideas?trash=true");
      if (trashRes && trashRes.ok) {
        const trashData = await trashRes.json();
        setTrashIdeas(trashData.ideas ?? []);
      }

      // Fetch Users
      const usersRes = await adminFetch("/api/admin/users");
      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users ?? []);
      }

      // Fetch Action Logs
      const logsRes = await adminFetch("/api/admin/logs");
      if (logsRes && logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs ?? []);
        if (logsData.db_warning) setDbWarning(true);
      }
    } catch (err) {
      setErrorMsg("Failed to synchronize dashboard with database.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, adminFetch]);

  // Sync data when admin logs in
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  // 4. Inactivity Monitor Logic
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    if (!isAdmin) return;

    inactivityTimerRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      setIsAdmin(false);
      alert("Session expired due to inactivity. For safety, you have been logged out.");
    }, INACTIVITY_TIMEOUT);
  }, [isAdmin]);

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "mousedown", "scroll"];
    
    if (isAdmin) {
      resetInactivityTimer();
      activityEvents.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });
    }

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isAdmin, resetInactivityTimer]);

  // 5. Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoginError(error.message || "Invalid authentication credentials.");
      } else {
        const userEmail = data.user?.email?.toLowerCase() || "";
        if (!ALLOWED_ADMINS.includes(userEmail)) {
          await supabase.auth.signOut();
          setLoginError("Access denied: You are not authorized to view the admin panel.");
        }
      }
    } catch {
      setLoginError("Connection failed. Check your internet connectivity.");
    } finally {
      setLoginLoading(false);
    }
  };

  // 6. Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSessionUser(null);
    setSessionToken("");
  };

  // 7. Toggle Idea Featured status
  const handleToggleFeatured = async (idea: Idea) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminFetch("/api/admin/ideas", {
        method: "PATCH",
        body: JSON.stringify({ id: idea.id, featured: !idea.featured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIdeas(prev =>
        prev.map(i => (i.id === idea.id ? { ...i, featured: !i.featured } : i))
      );
      setSuccessMsg(`Featured status updated for idea by ${idea.author}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData(); // Reload logs
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update featured flag.");
    }
  };

  // 8. Move Idea to Trash (Soft Delete)
  const handleSoftDelete = async (idea: Idea) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminFetch("/api/admin/ideas", {
        method: "PATCH",
        body: JSON.stringify({ id: idea.id, softDelete: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIdeas(prev => prev.filter(i => i.id !== idea.id));
      setSelectedIdea(null);
      setSuccessMsg(`Idea by ${idea.author} moved to trash successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to soft delete idea.");
    }
  };

  // 9. Restore Idea from Trash
  const handleRestore = async (idea: Idea) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminFetch("/api/admin/ideas", {
        method: "PATCH",
        body: JSON.stringify({ id: idea.id, restore: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrashIdeas(prev => prev.filter(i => i.id !== idea.id));
      setSuccessMsg(`Idea by ${idea.author} restored to active list.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to restore idea.");
    }
  };

  // 10. Permanently Purge Idea
  const handlePermanentDelete = async (idea: Idea) => {
    const confirmDelete = window.confirm(
      `CAUTION: Are you sure you want to permanently delete the idea by "${idea.author}"?\n\nThis action is irreversible and will purge it from the database.`
    );
    if (!confirmDelete) return;

    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminFetch("/api/admin/ideas", {
        method: "DELETE",
        body: JSON.stringify({ id: idea.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrashIdeas(prev => prev.filter(i => i.id !== idea.id));
      setSuccessMsg("Idea permanently purged from collection.");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to permanently delete idea.");
    }
  };

  // 11. Save Idea Review Notes & Status
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdea) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const updatedHistory = [
        ...(selectedIdea.review_history || []),
        {
          date: new Date().toISOString(),
          admin: sessionUser?.email || "Admin",
          prev_status: selectedIdea.status || "Pending",
          new_status: reviewStatus,
          notes: reviewNotes,
        },
      ];

      const res = await adminFetch("/api/admin/ideas", {
        method: "PATCH",
        body: JSON.stringify({
          id: selectedIdea.id,
          status: reviewStatus,
          review_notes: reviewNotes,
          review_history: updatedHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIdeas(prev =>
        prev.map(i =>
          i.id === selectedIdea.id
            ? {
                ...i,
                status: reviewStatus,
                review_notes: reviewNotes,
                review_history: updatedHistory,
              }
            : i
        )
      );
      setSelectedIdea(null);
      setSuccessMsg(`Review updated successfully for idea by ${selectedIdea.author}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save review details.");
    }
  };

  // 12. Toggle User Suspension
  const handleToggleUserRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictingUser) return;
    setErrorMsg("");
    setSuccessMsg("");
    const isSuspending = !restrictingUser.restricted;

    try {
      const res = await adminFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          userId: restrictingUser.id,
          restrict: isSuspending,
          reason: isSuspending ? restrictionReason : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers(prev =>
        prev.map(u =>
          u.id === restrictingUser.id
            ? { ...u, restricted: isSuspending, restriction_reason: isSuspending ? restrictionReason : "" }
            : u
        )
      );
      setRestrictingUser(null);
      setRestrictionReason("");
      setSuccessMsg(
        `User ${restrictingUser.email} status updated to ${isSuspending ? "RESTRICTED" : "ACTIVE"}.`
      );
      setTimeout(() => setSuccessMsg(""), 3000);
      loadDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to restrict/unsuspend user.");
    }
  };

  // Open Review Dialog details
  const openReviewModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setReviewStatus(idea.status || "Pending");
    setReviewNotes(idea.review_notes || "");
  };

  // 13. Search, Filter, Sort computations for Ideas list
  const getFilteredIdeas = () => {
    let list = [...ideas];

    // Search query
    if (ideaSearch.trim()) {
      const q = ideaSearch.toLowerCase();
      list = list.filter(
        i =>
          i.author.toLowerCase().includes(q) ||
          i.text.toLowerCase().includes(q) ||
          (i.ai_explanation && i.ai_explanation.toLowerCase().includes(q))
      );
    }

    // Era filter
    if (ideaEraFilter !== "all") {
      list = list.filter(i => i.era === ideaEraFilter);
    }

    // Status filter
    if (ideaStatusFilter !== "all") {
      list = list.filter(i => (i.status || "Pending") === ideaStatusFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (ideaSort === "created_at_desc") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (ideaSort === "created_at_asc") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (ideaSort === "votes_desc") {
        return b.upvotes - a.upvotes;
      }
      if (ideaSort === "votes_asc") {
        return a.upvotes - b.upvotes;
      }
      return 0;
    });

    return list;
  };

  const filteredIdeas = getFilteredIdeas();

  // Search filter for Users
  const filteredUsers = users.filter(
    u =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.team_name.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Statistics counters
  const counts = {
    totalUsers: users.length,
    totalIdeas: ideas.length + trashIdeas.length,
    activeIdeas: ideas.length,
    pending: ideas.filter(i => (i.status || "Pending") === "Pending").length,
    approved: ideas.filter(i => i.status === "Approved").length,
    underReview: ideas.filter(i => i.status === "Under Review").length,
    rejected: ideas.filter(i => i.status === "Rejected").length,
    trash: trashIdeas.length,
  };

  // 14. LOADING AND LOGIN SCREENS RENDERER
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060A] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <span className="text-sm tracking-wider font-semibold text-text-tertiary">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 transition-colors duration-500", lightMode ? "bg-[#F5F5FA]" : "bg-[#06060A]")}>
        {/* Neon blur background blobs */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-2xl text-left text-white"
        >
          {/* Edge Glow border */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50 blur-[1px] pointer-events-none" />

          {/* Theme Toggle in Login */}
          <button
            onClick={() => setLightMode(!lightMode)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-text-tertiary hover:text-white transition-colors"
          >
            {lightMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/[0.08] text-2xl shadow-inner mb-4">
              🔐
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-xs text-text-tertiary mt-1.5">
              Enter your Yugantar administrator email & password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yugantar.com"
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {loginError && (
              <p className="text-xs text-primary bg-primary/5 p-3 rounded-xl border border-primary/10 text-center">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary animate-gradient-xy" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loginLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Authenticate"
                )}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen pt-24 pb-16 px-4 sm:px-6 transition-colors duration-500 font-sans",
        lightMode ? "bg-[#F5F5FA] text-neutral-800" : "bg-[#06060A] text-white"
      )}
    >
      <div className="mx-auto max-w-7xl">
        {/* ════════════════════════════════════════════════════════════ */}
        {/* ADMIN PORTAL HEADER                                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                Secure Session Active
              </span>
              {dbWarning && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  ⚠️ Run 002_admin_system.sql Migration
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              YUGANTAR <span className="text-primary font-medium">Control Room</span>
            </h1>
            <p className="text-xs text-text-tertiary mt-1">
              Logged in as: <strong className="text-white">{sessionUser?.email}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLightMode(!lightMode)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-tertiary hover:text-white transition-colors"
            >
              {lightMode ? "🌙 Dark" : "☀️ Light"}
            </button>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-tertiary hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              ↻ Synchronize
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary/15 border border-primary/20 text-primary hover:bg-primary/20 transition-all shadow-[0_0_20px_rgba(255,59,48,0.15)]"
            >
              Exit Control Room
            </button>
          </div>
        </div>

        {/* Status messages popup */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-xs text-green-400 font-medium flex items-center gap-2"
            >
              <span>✅</span> {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/10 text-xs text-primary font-medium flex items-center gap-2"
            >
              <span>⚠️</span> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TABS SELECTOR MENU                                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="flex border-b border-white/[0.04] mb-8 overflow-x-auto gap-2 scrollbar-none pb-1">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "ideas", label: `💡 Ideas (${counts.activeIdeas})` },
            { id: "users", label: `👥 Users (${counts.totalUsers})` },
            { id: "trash", label: `🗑️ Trash (${counts.trash})` },
            { id: "logs", label: "📋 Activity Logs" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap border border-transparent",
                activeTab === tab.id
                  ? "bg-white/[0.06] border-white/[0.08] text-white"
                  : "text-text-tertiary hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-30 bg-black/10 backdrop-blur-[2px] flex items-center justify-center py-12 rounded-2xl">
              <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW                                */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Counters Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: counts.totalUsers, color: "text-white", border: "border-white/[0.06]" },
                  { label: "Active Ideas", value: counts.activeIdeas, color: "text-secondary", border: "border-secondary/20" },
                  { label: "Approved Review", value: counts.approved, color: "text-green-400", border: "border-green-500/20" },
                  { label: "Pending Audit", value: counts.pending, color: "text-amber-400", border: "border-amber-500/20" },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className={cn(
                      "glass-card p-6 text-center rounded-2xl border bg-neutral-900/10 flex flex-col justify-center items-center shadow-md",
                      stat.border
                    )}
                  >
                    <div className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-2">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submissions & Distributions Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SVG Chart 1: Idea Eras Distribution */}
                <div className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-neutral-900/10 flex flex-col">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-6">
                    Submission Category Spread
                  </h3>
                  <div className="flex items-center justify-around h-48">
                    {/* SVG Pie Chart */}
                    <svg viewBox="0 0 100 100" className="w-36 h-36 relative z-10 filter drop-shadow-[0_0_20px_rgba(0,242,254,0.15)]">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="20" />
                      {/* Fire (Gold) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#FF3B30"
                        strokeWidth="20"
                        strokeDasharray={`${(ideas.filter(i => i.era === "fire").length / (ideas.length || 1)) * 251.2} 251.2`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                      {/* Night (Platinum) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#BD10E0"
                        strokeWidth="20"
                        strokeDasharray={`${(ideas.filter(i => i.era === "night").length / (ideas.length || 1)) * 251.2} 251.2`}
                        strokeDashoffset={`-${(ideas.filter(i => i.era === "fire").length / (ideas.length || 1)) * 251.2}`}
                        transform="rotate(-90 50 50)"
                      />
                      {/* Sun (Champagne) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#00F2FE"
                        strokeWidth="20"
                        strokeDasharray={`${(ideas.filter(i => i.era === "sun").length / (ideas.length || 1)) * 251.2} 251.2`}
                        strokeDashoffset={`-${((ideas.filter(i => i.era === "fire").length + ideas.filter(i => i.era === "night").length) / (ideas.length || 1)) * 251.2}`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>

                    <div className="space-y-3">
                      {[
                        { label: "Gold (Fire)", color: "bg-primary", count: ideas.filter(i => i.era === "fire").length },
                        { label: "Platinum (Night)", color: "bg-[#BD10E0]", count: ideas.filter(i => i.era === "night").length },
                        { label: "Champagne (Sun)", color: "bg-secondary", count: ideas.filter(i => i.era === "sun").length },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <span className={cn("h-3 w-3 rounded-full", item.color)} />
                          <span className="text-text-secondary">{item.label}:</span>
                          <strong className="text-white">{item.count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SVG Chart 2: Idea Status distribution */}
                <div className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-neutral-900/10 flex flex-col">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-6">
                    Review Status Metrics
                  </h3>
                  <div className="h-48 flex items-end justify-between px-6 pt-4 relative">
                    {/* Render status bars */}
                    {[
                      { status: "Pending", count: counts.pending, color: "from-amber-400 to-amber-600" },
                      { status: "Approved", count: counts.approved, color: "from-green-400 to-green-600" },
                      { status: "Under Review", count: counts.underReview, color: "from-primary to-primary-dark" },
                      { status: "Rejected", count: counts.rejected, color: "from-red-500 to-red-700" },
                    ].map(bar => {
                      const maxVal = Math.max(counts.pending, counts.approved, counts.underReview, counts.rejected, 1);
                      const heightPct = `${(bar.count / maxVal) * 80}%`;

                      return (
                        <div key={bar.status} className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                          <div className="text-xs font-bold text-white">{bar.count}</div>
                          <div
                            className={cn("w-10 rounded-t-lg bg-gradient-to-t shadow-[0_0_15px_rgba(255,255,255,0.05)]", bar.color)}
                            style={{ height: heightPct }}
                          />
                          <div className="text-[9px] uppercase tracking-wider text-text-muted text-center truncate max-w-[80px]">
                            {bar.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Action logs preview */}
              <div className="glass-card p-6 rounded-2xl border border-white/[0.06] bg-neutral-900/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted">
                    Recent System Actions
                  </h3>
                  <button
                    onClick={() => setActiveTab("logs")}
                    className="text-[10px] uppercase tracking-widest text-primary hover:underline"
                  >
                    View All Logs
                  </button>
                </div>
                {logs.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">No recent events logged.</p>
                ) : (
                  <div className="space-y-3">
                    {logs.slice(0, 4).map(log => (
                      <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-base">📝</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-white truncate max-w-[200px]">
                              {log.admin_email}
                            </span>
                            <span className="text-[9px] text-text-muted">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary truncate">
                            <span className="font-semibold text-primary">{log.action}:</span> {log.target}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: IDEA MANAGEMENT                                   */}
          {/* ======================================================== */}
          {activeTab === "ideas" && (
            <div className="space-y-6 animate-fade-in">
              {/* Searching, Filters, & Sorting Panel */}
              <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-2xl border border-white/[0.06] bg-neutral-900/20">
                <input
                  type="text"
                  placeholder="🔍 Search ideas by author or text content..."
                  value={ideaSearch}
                  onChange={e => setIdeaSearch(e.target.value)}
                  className="flex-grow rounded-xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-xs text-text-secondary focus:outline-none"
                />

                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                  {/* Era filter */}
                  <select
                    value={ideaEraFilter}
                    onChange={e => setIdeaEraFilter(e.target.value)}
                    className="rounded-xl border border-white/[0.08] bg-[#121218] px-3 py-2.5 text-xs text-text-secondary focus:outline-none"
                  >
                    <option value="all">All Eras</option>
                    <option value="fire">Gold (Fire)</option>
                    <option value="night">Platinum (Night)</option>
                    <option value="sun">Champagne (Sun)</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={ideaStatusFilter}
                    onChange={e => setIdeaStatusFilter(e.target.value)}
                    className="rounded-xl border border-white/[0.08] bg-[#121218] px-3 py-2.5 text-xs text-text-secondary focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {/* Sorting */}
                  <select
                    value={ideaSort}
                    onChange={e => setIdeaSort(e.target.value)}
                    className="rounded-xl border border-white/[0.08] bg-[#121218] px-3 py-2.5 text-xs text-text-secondary focus:outline-none"
                  >
                    <option value="created_at_desc">Newest First</option>
                    <option value="created_at_asc">Oldest First</option>
                    <option value="votes_desc">Most Votes</option>
                    <option value="votes_asc">Least Votes</option>
                  </select>
                </div>
              </div>

              {/* Ideas List Grid */}
              {filteredIdeas.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/[0.06]">
                  <p className="text-2xl">🕯️</p>
                  <p className="text-xs text-text-tertiary mt-2">No active ideas match your filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIdeas.map(idea => (
                    <div
                      key={idea.id}
                      className="glass-card p-5 rounded-2xl border border-white/[0.06] bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      {/* Idea detail details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                            idea.era === "fire" ? "bg-primary/10 text-primary border border-primary/20" :
                            idea.era === "night" ? "bg-[#BD10E0]/10 text-[#BD10E0] border border-[#BD10E0]/20" :
                            "bg-secondary/10 text-secondary border border-secondary/20"
                          )}>
                            {ERA_CONFIG[idea.era].icon} {ERA_CONFIG[idea.era].label}
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                            idea.status === "Approved" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                            idea.status === "Under Review" ? "bg-primary/10 border-primary/20 text-primary" :
                            idea.status === "Rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          )}>
                            {idea.status || "Pending"}
                          </span>
                          {idea.featured && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                              ⭐ Featured
                            </span>
                          )}
                          <span className="text-[10px] text-text-muted md:ml-auto">
                            {idea.created_at ? new Date(idea.created_at).toLocaleString() : "Ancient Date"}
                          </span>
                        </div>
                        <blockquote className="text-sm leading-relaxed text-text-secondary group-hover:text-white transition-colors duration-300">
                          &ldquo;{idea.text}&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.03]">
                          <span className="text-[10px] text-text-tertiary">👤 Author: <strong className="text-white">{idea.author}</strong></span>
                          <span className="text-white/10">|</span>
                          <span className="text-[10px] text-text-tertiary">👍 Votes: <strong className="text-white">{idea.upvotes}</strong></span>
                        </div>
                      </div>

                      {/* Idea Action items */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => openReviewModal(idea)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
                        >
                          Audit & Review
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(idea)}
                          className={cn(
                            "px-3 py-2 text-xs font-semibold rounded-xl border transition-colors",
                            idea.featured
                              ? "bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                              : "bg-white/[0.02] border-white/[0.08] text-text-tertiary hover:text-white"
                          )}
                        >
                          {idea.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() => handleSoftDelete(idea)}
                          className="px-3 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Trash
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: USER MANAGEMENT                                   */}
          {/* ======================================================== */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl border border-white/[0.06] bg-neutral-900/20">
                <input
                  type="text"
                  placeholder="🔍 Search users by name, email, or team name..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-2.5 text-xs text-text-secondary focus:outline-none"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/[0.06]">
                  <p className="text-2xl">👥</p>
                  <p className="text-xs text-text-tertiary mt-2">No user profiles match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      className={cn(
                        "glass-card p-5 rounded-2xl border bg-neutral-900/10 flex flex-col justify-between gap-4 relative overflow-hidden",
                        u.restricted ? "border-primary/30" : "border-white/[0.06]"
                      )}
                    >
                      {/* Suspended Red Banner */}
                      {u.restricted && (
                        <div className="absolute top-0 right-0 bg-primary px-3 py-0.5 text-[8px] font-black uppercase tracking-widest text-white rounded-bl-lg">
                          SUSPENDED
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-primary">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{u.full_name}</h4>
                            <p className="text-[10px] text-text-tertiary truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-text-tertiary border-t border-white/[0.03]">
                          <div>📞 Phone: <strong className="text-white">{u.phone || "—"}</strong></div>
                          <div>🛡️ Team: <strong className="text-white">{u.team_name}</strong></div>
                        </div>

                        {u.idea_title && (
                          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-text-muted block">Submitted Idea Title</span>
                            <span className="text-[11px] font-semibold text-white truncate block mt-0.5">{u.idea_title}</span>
                          </div>
                        )}

                        {u.restricted && (
                          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-primary block">Reason for suspension</span>
                            <p className="text-[10px] text-primary-light italic mt-0.5">"{u.restriction_reason || "Violation of community rules."}"</p>
                          </div>
                        )}
                      </div>

                      {/* Toggle suspend buttons */}
                      <div className="pt-2 border-t border-white/[0.03] flex justify-end">
                        {u.restricted ? (
                          <button
                            onClick={() => { setRestrictingUser(u); handleToggleUserRestriction({ preventDefault: () => {} } as any); }}
                            className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-green-500/20 text-green-400 bg-green-500/5 hover:bg-green-500/10 transition-colors"
                          >
                            Unsuspend User
                          </button>
                        ) : (
                          <button
                            onClick={() => { setRestrictingUser(u); setRestrictionReason(""); }}
                            className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            Suspend User
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TRASH & RECOVERY                                  */}
          {/* ======================================================== */}
          {activeTab === "trash" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl border border-primary/10 bg-primary/[0.02]">
                <p className="text-xs text-primary font-medium flex items-center gap-2">
                  <span>🗑️</span> Trash Retention Area: Ideas deleted by admins are soft-deleted first. You can recover them below or permanently purge them.
                </p>
              </div>

              {trashIdeas.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/[0.06]">
                  <p className="text-2xl">🗑️</p>
                  <p className="text-xs text-text-tertiary mt-2">Trash is empty. No deleted ideas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trashIdeas.map(idea => (
                    <div
                      key={idea.id}
                      className="glass-card p-5 rounded-2xl border border-primary/10 bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary">
                            Trashed
                          </span>
                          <span className="text-[10px] text-text-muted">
                            Deleted on: {idea.deleted_at ? new Date(idea.deleted_at).toLocaleString() : "Recently"}
                          </span>
                        </div>
                        <blockquote className="text-sm leading-relaxed text-text-tertiary italic">
                          &ldquo;{idea.text}&rdquo;
                        </blockquote>
                        <div className="text-[10px] text-text-muted mt-2">— By: {idea.author}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestore(idea)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
                        >
                          Restore Idea
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(idea)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary/20 border border-primary/30 text-white hover:bg-primary/30 transition-colors"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SYSTEM ACTIVITY LOGS                              */}
          {/* ======================================================== */}
          {activeTab === "logs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Full Activity Logs Stream</h3>
                <span className="text-[10px] text-text-muted">{logs.length} entries registered</span>
              </div>

              {logs.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-2xl border border-white/[0.06]">
                  <p className="text-xs text-text-tertiary">No log events recorded.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-lg">⚙️</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white truncate">{log.admin_email}</span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Action: <strong className="text-primary">{log.action}</strong>
                        </p>
                        <p className="text-xs text-text-tertiary mt-1 italic">
                          Target: {log.target}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* DIALOG 1: IDEA AUDIT & REVIEW MODAL                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-900/60 p-6 md:p-8 shadow-2xl backdrop-blur-2xl text-left text-white max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedIdea(null)}
                className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-tertiary hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold text-white mb-2">Idea Audit & Review</h3>
              <p className="text-xs text-text-tertiary mb-6">Review proposed movement parameters, notes, and verify status.</p>

              <div className="space-y-6">
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted block">Author</span>
                    <span className="text-xs font-semibold text-white mt-1 block truncate">{selectedIdea.author}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted block">Era Category</span>
                    <span className="text-xs font-semibold text-white mt-1 block truncate">
                      {ERA_CONFIG[selectedIdea.era].icon} {ERA_CONFIG[selectedIdea.era].label}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted block">Upvotes</span>
                    <span className="text-xs font-semibold text-white mt-1 block">{selectedIdea.upvotes}</span>
                  </div>
                </div>

                {/* Idea text */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted block mb-2">Idea Proposal Text</span>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] text-sm text-text-secondary leading-relaxed">
                    &ldquo;{selectedIdea.text}&rdquo;
                  </div>
                </div>

                {/* AI Oracle Explanation */}
                {selectedIdea.ai_explanation && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mb-2">🤖 Oracle AI Interpretation</span>
                    <div className="p-4 rounded-xl bg-accent/[0.02] border border-accent/10 text-xs text-text-secondary leading-relaxed italic max-h-40 overflow-y-auto">
                      {selectedIdea.ai_explanation}
                    </div>
                  </div>
                )}

                {/* Form to review */}
                <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                        Approval Status
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={e => setReviewStatus(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#121218] px-3 py-2 text-xs text-text-secondary focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                        Reviewer Notes
                      </label>
                      <input
                        type="text"
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        placeholder="Add notes explaining the approval/rejection decision..."
                        className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-text-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Audit History Logs */}
                  {selectedIdea.review_history && selectedIdea.review_history.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Audit History Trail</span>
                      <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                        {selectedIdea.review_history.map((hist: any, index: number) => (
                          <div key={index} className="p-2 rounded-lg bg-white/[0.01] border border-white/[0.03] text-[10px] text-text-tertiary flex flex-col gap-0.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{hist.admin}</span>
                              <span>{new Date(hist.date).toLocaleString()}</span>
                            </div>
                            <div>
                              Transitioned status from <strong className="text-amber-400">{hist.prev_status}</strong> to <strong className="text-green-400">{hist.new_status}</strong>.
                            </div>
                            {hist.notes && <div className="italic text-text-muted">Notes: "{hist.notes}"</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIdea(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white"
                    >
                      Commit Review Decision
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* DIALOG 2: USER SUSPENSION REASON INPUT                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {restrictingUser && !restrictingUser.restricted && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRestrictingUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-900/60 p-6 shadow-2xl backdrop-blur-2xl text-left text-white"
            >
              <h3 className="text-lg font-bold text-white mb-2">Suspend User Account</h3>
              <p className="text-xs text-text-tertiary mb-4">
                Input the reason for restricting <strong>{restrictingUser.email}</strong>. The user will be blocked from submitting further ideas.
              </p>

              <form onSubmit={handleToggleUserRestriction} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                    Suspension Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={restrictionReason}
                    onChange={e => setRestrictionReason(e.target.value)}
                    placeholder="e.g. Inappropriate submissions or community guideline violations..."
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-text-secondary focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRestrictingUser(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
