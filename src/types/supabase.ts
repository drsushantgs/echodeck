export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          email: string | null;
          message: string;
          page_url: string | null;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          email?: string | null;
          message: string;
          page_url?: string | null;
          resolved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
      };
      feedback_responses: {
        Row: {
          id: string;
          created_at: string;
          feedback_id: string;
          sender_role: "admin" | "user";
          message: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          feedback_id: string;
          sender_role: "admin" | "user";
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["feedback_responses"]["Insert"]>;
      };
    };
  };
}