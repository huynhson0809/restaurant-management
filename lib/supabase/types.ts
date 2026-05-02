export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          name_en: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string | null
          parent_id: string | null
          name: string
          name_en: string | null
          description: string | null
          description_en: string | null
          price: number
          image_url: string | null
          images: string[] | null
          is_available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          parent_id?: string | null
          name: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          price: number
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          parent_id?: string | null
          name?: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          price?: number
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          table_number: number
          name: string | null
          capacity: number
          is_active: boolean
          qr_code_token: string
          session_token: string
          session_started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_number: number
          name?: string | null
          capacity?: number
          is_active?: boolean
          qr_code_token?: string
          session_token?: string
          session_started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_number?: number
          name?: string | null
          capacity?: number
          is_active?: boolean
          qr_code_token?: string
          session_token?: string
          session_started_at?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          table_id: string | null
          session_id: string
          status: 'new' | 'preparing' | 'ready' | 'done' | 'cancelled'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          table_id?: string | null
          session_id: string
          status?: 'new' | 'preparing' | 'ready' | 'done' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          table_id?: string | null
          session_id?: string
          status?: 'new' | 'preparing' | 'ready' | 'done' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          menu_item_id: string | null
          quantity: number
          unit_price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          quantity?: number
          unit_price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          quantity?: number
          unit_price?: number
          notes?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: 'admin' | 'cashier'
          full_name: string | null
          is_active: boolean
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: 'admin' | 'cashier'
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: 'admin' | 'cashier'
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          last_login?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Table = Database['public']['Tables']['tables']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']

export type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_item: MenuItem | null })[]
  table: Table | null
}

export type MenuItemWithCategory = MenuItem & {
  category: Category | null
}

export type CartItem = {
  menuItem: MenuItem
  quantity: number
  notes: string
}
