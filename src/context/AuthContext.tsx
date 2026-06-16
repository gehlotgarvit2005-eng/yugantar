"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  team_name: string;
  idea_title: string;
  idea_description: string;
  submission_status: string;
}

export type AuthTab = "signin" | "signup" | "otp" | "forgot" | "dashboard";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthTab;
  tempEmail: string;
  authWarning: string;
  openAuthModal: (tab?: AuthTab, warning?: string) => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: AuthTab) => void;
  setTempEmail: (email: string) => void;
  setAuthWarning: (warning: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>("signin");
  const [tempEmail, setTempEmail] = useState("");
  const [authWarning, setAuthWarning] = useState("");

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: metadata.full_name || "",
          phone: metadata.phone || "",
          team_name: metadata.team_name || "",
          idea_title: metadata.idea_title || "",
          idea_description: metadata.idea_description || "",
          submission_status: metadata.submission_status || "Pending",
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: metadata.full_name || "",
            phone: metadata.phone || "",
            team_name: metadata.team_name || "",
            idea_title: metadata.idea_title || "",
            idea_description: metadata.idea_description || "",
            submission_status: metadata.submission_status || "Pending",
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: AuthTab = "signin", warning = "") => {
    setAuthWarning(warning);
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      closeAuthModal();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        tempEmail,
        authWarning,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        setTempEmail,
        setAuthWarning,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
