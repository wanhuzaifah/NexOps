// NexOps — Supabase Database Types
// Matches supabase_schema.sql exactly
// Replace with auto-generated types once Supabase project is set up:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          ssm_no: string | null
          cidb_no: string | null
          brand_name: string | null
          brand_reg: string | null
          address: string | null
          phone: string | null
          phone2: string | null
          email: string | null
          website: string | null
          bank_name: string | null
          bank_account: string | null
          bank_holder: string | null
          director_name: string | null
          director_title: string | null
          logo_url: string | null
          cop_url: string | null
          signature_url: string | null
          letterhead_url: string | null
          stamp_positions: Record<string, unknown>
          boss_email: string | null
          telegram_chat_ids: string[]
          settings: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          ssm_no?: string | null
          cidb_no?: string | null
          brand_name?: string | null
          brand_reg?: string | null
          address?: string | null
          phone?: string | null
          phone2?: string | null
          email?: string | null
          website?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          director_name?: string | null
          director_title?: string | null
          logo_url?: string | null
          cop_url?: string | null
          signature_url?: string | null
          letterhead_url?: string | null
          stamp_positions?: Record<string, unknown>
          boss_email?: string | null
          telegram_chat_ids?: string[]
          settings?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          ssm_no?: string | null
          cidb_no?: string | null
          brand_name?: string | null
          brand_reg?: string | null
          address?: string | null
          phone?: string | null
          phone2?: string | null
          email?: string | null
          website?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          director_name?: string | null
          director_title?: string | null
          logo_url?: string | null
          cop_url?: string | null
          signature_url?: string | null
          letterhead_url?: string | null
          stamp_positions?: Record<string, unknown>
          boss_email?: string | null
          telegram_chat_ids?: string[]
          settings?: Record<string, unknown>
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          role: 'admin' | 'manager' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          company_id?: string | null
          full_name?: string | null
          role?: 'admin' | 'manager' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          full_name?: string | null
          role?: 'admin' | 'manager' | 'viewer'
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          company_id: string | null
          name: string
          pic_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          pic_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          pic_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          type: 'report' | 'timesheet' | 'work_order' | 'delivery_order' | 'other'
          title: string | null
          status: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url: string | null
          signed_url: string | null
          notes: string | null
          created_at: string
          signed_at: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          type?: 'report' | 'timesheet' | 'work_order' | 'delivery_order' | 'other'
          title?: string | null
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url?: string | null
          signed_url?: string | null
          notes?: string | null
          created_at?: string
          signed_at?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          type?: 'report' | 'timesheet' | 'work_order' | 'delivery_order' | 'other'
          title?: string | null
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url?: string | null
          signed_url?: string | null
          notes?: string | null
          created_at?: string
          signed_at?: string | null
          sent_at?: string | null
        }
      }
      ndt_reports: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          method: 'RT' | 'UT' | 'MPI' | 'DPI' | 'PMI' | 'HT' | 'PAUT' | 'UTTG' | 'WQT'
          report_no: string | null
          project_name: string | null
          project_no: string | null
          po_no: string | null
          location: string | null
          date_of_inspection: string
          procedure_no: string | null
          drawing_no: string | null
          material: string | null
          material_grade: string | null
          material_thickness: number | null
          weld_process: string | null
          joint_type: string | null
          surface_condition: string | null
          surface_temp: number | null
          method_data: Record<string, unknown>
          findings: Record<string, unknown>[]
          overall_result: 'ACCEPT' | 'REJECT' | 'CONDITIONAL' | null
          remarks: string | null
          inspector_name: string | null
          inspector_cert_type: string | null
          inspector_cert_no: string | null
          inspector_cert_level: string | null
          inspector_cert_expiry: string | null
          status: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url: string | null
          signed_url: string | null
          created_at: string
          signed_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          method: 'RT' | 'UT' | 'MPI' | 'DPI' | 'PMI' | 'HT' | 'PAUT' | 'UTTG' | 'WQT'
          report_no?: string | null
          project_name?: string | null
          project_no?: string | null
          po_no?: string | null
          location?: string | null
          date_of_inspection?: string
          procedure_no?: string | null
          drawing_no?: string | null
          material?: string | null
          material_grade?: string | null
          material_thickness?: number | null
          weld_process?: string | null
          joint_type?: string | null
          surface_condition?: string | null
          surface_temp?: number | null
          method_data?: Record<string, unknown>
          findings?: Record<string, unknown>[]
          overall_result?: 'ACCEPT' | 'REJECT' | 'CONDITIONAL' | null
          remarks?: string | null
          inspector_name?: string | null
          inspector_cert_type?: string | null
          inspector_cert_no?: string | null
          inspector_cert_level?: string | null
          inspector_cert_expiry?: string | null
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url?: string | null
          signed_url?: string | null
          created_at?: string
          signed_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          method?: 'RT' | 'UT' | 'MPI' | 'DPI' | 'PMI' | 'HT' | 'PAUT' | 'UTTG' | 'WQT'
          report_no?: string | null
          project_name?: string | null
          project_no?: string | null
          po_no?: string | null
          location?: string | null
          date_of_inspection?: string
          procedure_no?: string | null
          drawing_no?: string | null
          material?: string | null
          material_grade?: string | null
          material_thickness?: number | null
          weld_process?: string | null
          joint_type?: string | null
          surface_condition?: string | null
          surface_temp?: number | null
          method_data?: Record<string, unknown>
          findings?: Record<string, unknown>[]
          overall_result?: 'ACCEPT' | 'REJECT' | 'CONDITIONAL' | null
          remarks?: string | null
          inspector_name?: string | null
          inspector_cert_type?: string | null
          inspector_cert_no?: string | null
          inspector_cert_level?: string | null
          inspector_cert_expiry?: string | null
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          original_url?: string | null
          signed_url?: string | null
          created_at?: string
          signed_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          inv_number: string | null
          issue_date: string
          due_date: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          amount_paid: number
          balance: number
          notes: string | null
          pdf_url: string | null
          created_at: string
          sent_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          inv_number?: string | null
          issue_date?: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          amount_paid?: number
          balance?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
          sent_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          inv_number?: string | null
          issue_date?: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          amount_paid?: number
          balance?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
          sent_at?: string | null
          paid_at?: string | null
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string | null
          description: string
          qty: number
          unit_price: number
          amount: number
          sort_order: number
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          description: string
          qty?: number
          unit_price?: number
          amount?: number
          sort_order?: number
        }
        Update: {
          id?: string
          invoice_id?: string | null
          description?: string
          qty?: number
          unit_price?: number
          amount?: number
          sort_order?: number
        }
      }
      quotations: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          quo_number: string | null
          issue_date: string
          valid_until: string | null
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          pdf_url: string | null
          converted_to_invoice_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          quo_number?: string | null
          issue_date?: string
          valid_until?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          pdf_url?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          quo_number?: string | null
          issue_date?: string
          valid_until?: string | null
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          pdf_url?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string
        }
      }
      quotation_items: {
        Row: {
          id: string
          quotation_id: string | null
          description: string
          qty: number
          unit_price: number
          amount: number
          sort_order: number
        }
        Insert: {
          id?: string
          quotation_id?: string | null
          description: string
          qty?: number
          unit_price?: number
          amount?: number
          sort_order?: number
        }
        Update: {
          id?: string
          quotation_id?: string | null
          description?: string
          qty?: number
          unit_price?: number
          amount?: number
          sort_order?: number
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string | null
          amount: number
          payment_date: string
          method: string | null
          reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          amount: number
          payment_date?: string
          method?: string | null
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string | null
          amount?: number
          payment_date?: string
          method?: string | null
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          company_id: string | null
          name: string
          ic_no: string | null
          position: string | null
          cert_type: 'PCN' | 'CSWIP' | 'ASNT SNT-TC-1A' | 'DOSH' | 'CIDB' | 'Other' | null
          cert_no: string | null
          cert_level: 'Level I' | 'Level II' | 'Level III' | null
          cert_expiry: string | null
          daily_rate: number | null
          status: 'available' | 'deployed' | 'leave'
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          ic_no?: string | null
          position?: string | null
          cert_type?: 'PCN' | 'CSWIP' | 'ASNT SNT-TC-1A' | 'DOSH' | 'CIDB' | 'Other' | null
          cert_no?: string | null
          cert_level?: 'Level I' | 'Level II' | 'Level III' | null
          cert_expiry?: string | null
          daily_rate?: number | null
          status?: 'available' | 'deployed' | 'leave'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          ic_no?: string | null
          position?: string | null
          cert_type?: 'PCN' | 'CSWIP' | 'ASNT SNT-TC-1A' | 'DOSH' | 'CIDB' | 'Other' | null
          cert_no?: string | null
          cert_level?: 'Level I' | 'Level II' | 'Level III' | null
          cert_expiry?: string | null
          daily_rate?: number | null
          status?: 'available' | 'deployed' | 'leave'
          created_at?: string
        }
      }
      timesheets: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          personnel_id: string | null
          project_name: string | null
          project_location: string | null
          month_year: string
          entries: Record<string, unknown>[]
          total_normal_hours: number
          total_ot_hours: number
          daily_rate: number
          ot_rate_multiplier: number
          total_amount: number
          status: 'unsigned' | 'signed' | 'sent' | 'archived'
          signed_url: string | null
          ts_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          personnel_id?: string | null
          project_name?: string | null
          project_location?: string | null
          month_year: string
          entries?: Record<string, unknown>[]
          total_normal_hours?: number
          total_ot_hours?: number
          daily_rate?: number
          ot_rate_multiplier?: number
          total_amount?: number
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          signed_url?: string | null
          ts_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          personnel_id?: string | null
          project_name?: string | null
          project_location?: string | null
          month_year?: string
          entries?: Record<string, unknown>[]
          total_normal_hours?: number
          total_ot_hours?: number
          daily_rate?: number
          ot_rate_multiplier?: number
          total_amount?: number
          status?: 'unsigned' | 'signed' | 'sent' | 'archived'
          signed_url?: string | null
          ts_number?: string | null
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          company_id: string | null
          name: string
          type: 'NDT' | 'Welding' | 'Painting' | 'Safety' | 'Other'
          serial_no: string | null
          calibration_date: string | null
          calibration_due: string | null
          calibration_cert_url: string | null
          status: 'available' | 'deployed' | 'calibration_due' | 'out_of_service'
          assigned_to_project: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          type?: 'NDT' | 'Welding' | 'Painting' | 'Safety' | 'Other'
          serial_no?: string | null
          calibration_date?: string | null
          calibration_due?: string | null
          calibration_cert_url?: string | null
          status?: 'available' | 'deployed' | 'calibration_due' | 'out_of_service'
          assigned_to_project?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          type?: 'NDT' | 'Welding' | 'Painting' | 'Safety' | 'Other'
          serial_no?: string | null
          calibration_date?: string | null
          calibration_due?: string | null
          calibration_cert_url?: string | null
          status?: 'available' | 'deployed' | 'calibration_due' | 'out_of_service'
          assigned_to_project?: string | null
          created_at?: string
        }
      }
      email_threads: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          subject: string | null
          status: 'pending' | 'replied' | 'overdue'
          last_sent_at: string | null
          last_reply_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          subject?: string | null
          status?: 'pending' | 'replied' | 'overdue'
          last_sent_at?: string | null
          last_reply_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          client_id?: string | null
          subject?: string | null
          status?: 'pending' | 'replied' | 'overdue'
          last_sent_at?: string | null
          last_reply_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      market_digests: {
        Row: {
          id: string
          company_id: string | null
          content: string
          sources: string[]
          scope: 'malaysia' | 'global' | 'custom'
          topic: string | null
          type: 'digest' | 'research'
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          content: string
          sources?: string[]
          scope?: 'malaysia' | 'global' | 'custom'
          topic?: string | null
          type?: 'digest' | 'research'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          content?: string
          sources?: string[]
          scope?: 'malaysia' | 'global' | 'custom'
          topic?: string | null
          type?: 'digest' | 'research'
          created_at?: string
        }
      }
      research_history: {
        Row: {
          id: string
          company_id: string | null
          topic: string
          result: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          topic: string
          result: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          topic?: string
          result?: string
          created_at?: string
        }
      }
      tender_cache: {
        Row: {
          id: string
          company_id: string | null
          source: string
          source_url: string | null
          tender_id_external: string | null
          title: string | null
          agency: string | null
          estimated_value: string | null
          closing_date: string | null
          tender_type: string | null
          location: string | null
          relevance_score: number | null
          match_reasons: string[]
          raw_content: string | null
          status: 'new' | 'saved' | 'ignored' | 'applied'
          tender_posted_at: string | null
          scraped_at: string
          notified_at: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          source: string
          source_url?: string | null
          tender_id_external?: string | null
          title?: string | null
          agency?: string | null
          estimated_value?: string | null
          closing_date?: string | null
          tender_type?: string | null
          location?: string | null
          relevance_score?: number | null
          match_reasons?: string[]
          raw_content?: string | null
          status?: 'new' | 'saved' | 'ignored' | 'applied'
          tender_posted_at?: string | null
          scraped_at?: string
          notified_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          source?: string
          source_url?: string | null
          tender_id_external?: string | null
          title?: string | null
          agency?: string | null
          estimated_value?: string | null
          closing_date?: string | null
          tender_type?: string | null
          location?: string | null
          relevance_score?: number | null
          match_reasons?: string[]
          raw_content?: string | null
          status?: 'new' | 'saved' | 'ignored' | 'applied'
          tender_posted_at?: string | null
          scraped_at?: string
          notified_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_company_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_next_invoice_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      get_next_quotation_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      get_next_report_number: {
        Args: { p_company_id: string; p_method: string }
        Returns: string
      }
      get_next_timesheet_number: {
        Args: { p_company_id: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
