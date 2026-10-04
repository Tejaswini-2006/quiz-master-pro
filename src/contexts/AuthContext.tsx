import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsGuest: (guestName?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = "quiz_master_guest_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest user session exists in localStorage
    const storedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
    if (storedGuest) {
      try {
        const guestData = JSON.parse(storedGuest);
        setUser(guestData);
        setLoading(false);
      } catch (e) {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
      } else if (!localStorage.getItem(GUEST_STORAGE_KEY)) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
      } else if (!localStorage.getItem(GUEST_STORAGE_KEY)) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInAsGuest = (guestName = "Quiz Explorer") => {
    const guestUser: any = {
      id: `guest_${Date.now()}`,
      email: "guest@quizmaster.pro",
      user_metadata: { name: guestName },
      app_metadata: { provider: "guest" },
      aud: "authenticated",
      created_at: new Date().toISOString()
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setSession(null);
  };

  const signOut = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("SignOut Supabase notice:", e);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
