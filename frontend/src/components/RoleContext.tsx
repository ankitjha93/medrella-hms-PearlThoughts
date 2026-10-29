'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/mockData';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  loading: boolean;
  switchUser: (userIdOrRole: string) => void;
  setRole: (userIdOrRole: string) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  allUsers: User[];
}

const RoleContext = createContext<AuthContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default to Patient John Doe
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = createClient();

    // 1. If Supabase is configured, listen to real session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          mapSupabaseUser(session.user);
        } else {
          setIsAuthenticated(false);
          // Restore demo user if previously selected
          restoreSavedDemoUser();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          mapSupabaseUser(session.user);
        } else {
          setIsAuthenticated(false);
          restoreSavedDemoUser();
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Demo fallback mode
      restoreSavedDemoUser();
      setLoading(false);
    }
  }, []);

  const restoreSavedDemoUser = () => {
    const savedUserId = localStorage.getItem('medrella_demo_user');
    if (savedUserId) {
      const found = INITIAL_USERS.find(
        u => u.id === savedUserId || u.doctorId === savedUserId || u.role === savedUserId
      );
      if (found) {
        setCurrentUser(found);
        setIsAuthenticated(true);
        return;
      }
    }
    // Default demo user
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
  };

  const mapSupabaseUser = async (sbUser: any) => {
    setIsAuthenticated(true);
    const supabase = createClient();
    let profileData: any = null;

    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();
      profileData = data;
    }

    const role: Role = (profileData?.role || sbUser.user_metadata?.role || 'PATIENT') as Role;
    const name: string = profileData?.name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User';

    const user: User = {
      id: sbUser.id,
      name,
      email: sbUser.email || '',
      role,
      avatar: profileData?.avatar_url || sbUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      doctorId: profileData?.doctor_id,
      patientId: profileData?.patient_id || 'pat_1',
    };

    setCurrentUser(user);
  };

  const switchUser = (userIdOrRole: string) => {
    const target = userIdOrRole.toLowerCase();
    const found = INITIAL_USERS.find(
      u =>
        u.id === userIdOrRole ||
        u.doctorId === userIdOrRole ||
        (userIdOrRole === 'doc-01' && u.doctorId === 'doc_1') ||
        (userIdOrRole === 'doc-02' && u.doctorId === 'doc_2') ||
        u.role === userIdOrRole ||
        u.role.toLowerCase() === target ||
        (target === 'admin' && u.role === 'ADMIN') ||
        (target === 'doctor' && u.role === 'DOCTOR') ||
        (target === 'patient' && u.role === 'PATIENT')
    );
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('medrella_demo_user', found.id);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = createClient();
    if (!supabase) {
      // Demo authentication simulation
      const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        switchUser(found.id);
        return {};
      }
      // If password provided in demo mode, authenticate as patient
      setCurrentUser({
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        patientId: 'pat_1',
      });
      setIsAuthenticated(true);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<{ error?: string }> => {
    const supabase = createClient();
    if (!supabase) {
      // Demo sign up simulation
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        patientId: 'pat_1',
      };
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role: 'PATIENT',
        },
      },
    });

    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('medrella_demo_user');
    setIsAuthenticated(false);
    setCurrentUser(INITIAL_USERS[0]); // fallback
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isSupabaseConfigured: isConfigured,
        loading,
        switchUser,
        setRole: switchUser,
        signIn,
        signUp,
        signOut,
        allUsers: INITIAL_USERS,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export const useAuth = useRole;
