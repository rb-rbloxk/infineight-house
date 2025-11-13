import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if we have valid environment variables
let supabase: any = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  );
} else {
  // Create a mock client for development
  const createMockQuery = () => {
    const query = {
      eq: (column: string, value: any) => query,
      neq: (column: string, value: any) => query,
      gt: (column: string, value: any) => query,
      gte: (column: string, value: any) => query,
      lt: (column: string, value: any) => query,
      lte: (column: string, value: any) => query,
      like: (column: string, pattern: string) => query,
      ilike: (column: string, pattern: string) => query,
      is: (column: string, value: any) => query,
      in: (column: string, values: any[]) => query,
      contains: (column: string, value: any) => query,
      containedBy: (column: string, value: any) => query,
      rangeGt: (column: string, value: any) => query,
      rangeGte: (column: string, value: any) => query,
      rangeLt: (column: string, value: any) => query,
      rangeLte: (column: string, value: any) => query,
      rangeAdjacent: (column: string, value: any) => query,
      overlaps: (column: string, value: any) => query,
      textSearch: (column: string, query: string) => query,
      match: (query: any) => query,
      not: (column: string, operator: string, value: any) => query,
      or: (filters: string) => query,
      filter: (column: string, operator: string, value: any) => query,
      order: (column: string, options?: { ascending?: boolean }) => query,
      limit: (count: number) => query,
      range: (from: number, to: number) => query,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any, reject?: any) => Promise.resolve({ data: [], error: null }).then(resolve, reject)
    };
    return query;
  };

  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.resolve({ error: null })
    },
    from: (table: string) => ({
      select: (columns?: string) => createMockQuery(),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => createMockQuery(),
      delete: () => createMockQuery(),
      upsert: (data: any) => Promise.resolve({ data: null, error: null })
    })
  };
}

export { supabase };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  base_price: number;
  base_image_url: string | null;
  image_urls: string[] | null; // Array of image URLs for multiple product images
  available_colors: string[];
  available_sizes: string[];
  is_customizable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Design = {
  id: string;
  user_id: string;
  product_id: string;
  design_data: any;
  preview_url: string | null;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  payment_status: string;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  design_id: string | null;
  quantity: number;
  unit_price: number;
  size: string | null;
  color: string | null;
  customization_details: any;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  design_id: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  customization_details: any;
  created_at: string;
  updated_at: string;
};

export type CorporateEnquiry = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  product_interest: string | null;
  quantity: number | null;
  budget_range: string | null;
  logo_url: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};
