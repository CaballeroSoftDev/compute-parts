import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        // No mostrar error en consola para errores de perfil
        setError(error.message);
        return;
      }

      setProfile(data);
    } catch (err) {
      // No mostrar error en consola para errores de perfil
      setError(err instanceof Error ? err.message : 'Error fetching profile');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // Manejar silenciosamente errores de sesión faltante
          if (error.message.includes('Auth session missing') || error.message.includes('AuthSessionMissingError')) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          // Solo mostrar otros errores de autenticación
          console.error('Error getting user:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        setUser(user);

        if (user) {
          await fetchProfile(user.id);
        }
      } catch (err) {
        // Manejar silenciosamente errores de sesión faltante
        if (
          err instanceof Error &&
          (err.message.includes('Auth session missing') || err.message.includes('AuthSessionMissingError'))
        ) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Solo mostrar otros errores
        console.error('Error in getUser:', err);
        setError(err instanceof Error ? err.message : 'Error getting user');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isSuperAdmin = profile?.role === 'superadmin';

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    isSuperAdmin,
    refreshProfile,
  };
}
