'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { UserRole, ROLE_CONFIG } from './types';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  role?: UserRole;
  email_verified?: boolean;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  hasPermission: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Función para verificar permisos
  const hasPermission = (permission: string): boolean => {
    if (!profile?.role) return false;

    const roleConfig = ROLE_CONFIG[profile.role];
    return roleConfig?.permissions?.includes(permission) || false;
  };

  // Función para actualizar perfil
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) return { error: { message: 'Usuario no autenticado' } };

    try {
      const { error } = await supabase.from('profiles').update(data).eq('id', user.id);

      if (!error) {
        // Actualizar el estado local
        setProfile((prev) => (prev ? { ...prev, ...data } : null));
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // Obtener perfil si hay usuario y no tenemos datos del perfil
      if (session?.user && !profile) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Solo obtener perfil si no tenemos datos o si el usuario cambió
        if (!profile || profile.id !== session.user.id) {
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [profile]); // Agregar profile como dependencia para evitar llamadas innecesarias

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { error, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Determinar el rol del usuario
  const userRole = profile?.role || null;

  const value = {
    user,
    profile,
    session,
    loading,
    userRole,
    hasPermission,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
