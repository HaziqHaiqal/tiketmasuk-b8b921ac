export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_details: Json
          booking_type: string
          completed_at: string | null
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_details?: Json
          booking_type: string
          completed_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_details?: Json
          booking_type?: string
          completed_at?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string
          event_date: number
          faq: Json | null
          id: string
          image_storage_id: string | null
          is_cancelled: boolean | null
          location: string
          name: string
          price: number
          total_tickets: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          event_date: number
          faq?: Json | null
          id?: string
          image_storage_id?: string | null
          is_cancelled?: boolean | null
          location: string
          name: string
          price: number
          total_tickets: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          event_date?: number
          faq?: Json | null
          id?: string
          image_storage_id?: string | null
          is_cancelled?: boolean | null
          location?: string
          name?: string
          price?: number
          total_tickets?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      management_profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          business_address: string | null
          business_description: string | null
          business_name: string
          business_phone: string | null
          business_registration_number: string | null
          created_at: string | null
          events_count: number | null
          id: string
          image: string | null
          location: string | null
          rating: number | null
          rejection_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name: string
          business_phone?: string | null
          business_registration_number?: string | null
          created_at?: string | null
          events_count?: number | null
          id?: string
          image?: string | null
          location?: string | null
          rating?: number | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name?: string
          business_phone?: string | null
          business_registration_number?: string | null
          created_at?: string | null
          events_count?: number | null
          id?: string
          image?: string | null
          location?: string | null
          rating?: number | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          image: string | null
          in_stock: boolean | null
          original_price: number | null
          price: number
          rating: number | null
          reviews: number | null
          title: string
          updated_at: string
          variants: Json | null
          vendor_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          original_price?: number | null
          price: number
          rating?: number | null
          reviews?: number | null
          title: string
          updated_at?: string
          variants?: Json | null
          vendor_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews?: number | null
          title?: string
          updated_at?: string
          variants?: Json | null
          vendor_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: number
          permission: string
          role_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          permission: string
          role_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          permission?: string
          role_name?: string
        }
        Relationships: []
      }
      ticket_holders: {
        Row: {
          address: string
          booking_id: string | null
          country: string
          created_at: string
          date_of_birth: string
          email: string
          full_name: string
          gender: string
          ic_passport: string
          id: string
          phone: string
          postcode: string
          state: string
          ticket_type: string
          updated_at: string
        }
        Insert: {
          address: string
          booking_id?: string | null
          country?: string
          created_at?: string
          date_of_birth: string
          email: string
          full_name: string
          gender: string
          ic_passport: string
          id?: string
          phone: string
          postcode: string
          state: string
          ticket_type: string
          updated_at?: string
        }
        Update: {
          address?: string
          booking_id?: string | null
          country?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          full_name?: string
          gender?: string
          ic_passport?: string
          id?: string
          phone?: string
          postcode?: string
          state?: string
          ticket_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_holders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          role_name: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          role_name: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          role_name?: string
          user_id?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          offer_expires_at: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          offer_expires_at?: number | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          offer_expires_at?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_reservation: {
        Args: { reservation_uuid: string }
        Returns: boolean
      }
      check_ticket_availability: {
        Args: { event_uuid: string }
        Returns: Json
      }
      cleanup_expired_offers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      expire_ticket_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_waiting_list_offers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_promoted_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          event_id: string
          event_name: string
          event_description: string
          event_date: number
          event_location: string
          event_price: number
          event_image: string
          promotion_expires_at: string
        }[]
      }
      get_queue_position: {
        Args: { event_uuid: string; user_uuid: string }
        Returns: Json
      }
      get_queue_stats: {
        Args: { event_uuid: string }
        Returns: {
          total_waiting: number
          current_position: number
          user_in_queue: boolean
        }[]
      }
      get_user_queue_position: {
        Args: { event_uuid: string; user_uuid: string }
        Returns: {
          entry_id: string
          entry_status: string
          queue_position: number
          offer_expires_at: number
          created_at: string
        }[]
      }
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      join_waiting_list: {
        Args:
          | { event_uuid: string; user_uuid?: string }
          | { event_uuid: string; user_uuid?: string }
        Returns: Json
      }
      process_queue: {
        Args: { event_uuid: string }
        Returns: Json
      }
      process_ticket_queue: {
        Args: Record<PropertyKey, never> | { event_uuid?: string }
        Returns: number
      }
      release_ticket: {
        Args: { event_uuid: string; waiting_list_uuid: string }
        Returns: Json
      }
      release_ticket_offer: {
        Args: { event_uuid: string; waiting_list_uuid: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
