import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
  },
});

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          state: string | null;
          country: string | null;
          role: string | null;
          is_first_purchase: boolean | null;
          email_verified: boolean | null;
          notifications_enabled: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          state?: string | null;
          country?: string | null;
          role?: string | null;
          is_first_purchase?: boolean | null;
          email_verified?: boolean | null;
          notifications_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          state?: string | null;
          country?: string | null;
          role?: string | null;
          is_first_purchase?: boolean | null;
          email_verified?: boolean | null;
          notifications_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          brand_id: string | null;
          sku: string | null;
          price: number;
          compare_price: number | null;
          cost_price: number | null;
          stock_quantity: number | null;
          low_stock_threshold: number | null;
          weight: number | null;
          dimensions: any | null;
          specifications: any | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          is_bestseller: boolean | null;
          meta_title: string | null;
          meta_description: string | null;
          tags: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          sku?: string | null;
          price: number;
          compare_price?: number | null;
          cost_price?: number | null;
          stock_quantity?: number | null;
          low_stock_threshold?: number | null;
          weight?: number | null;
          dimensions?: any | null;
          specifications?: any | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          is_bestseller?: boolean | null;
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          sku?: string | null;
          price?: number;
          compare_price?: number | null;
          cost_price?: number | null;
          stock_quantity?: number | null;
          low_stock_threshold?: number | null;
          weight?: number | null;
          dimensions?: any | null;
          specifications?: any | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          is_bestseller?: boolean | null;
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};
