export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  core_compliance: {
    Tables: {
      anonymization_mappings: {
        Row: {
          activated_at: string | null;
          activated_by: string | null;
          anonymized_check_column: string;
          created_at: string;
          entity_type: string;
          field_strategies: Json;
          id: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active: boolean;
          jsonb_field_strategies: Json | null;
          retention_event_column: string | null;
          status: string;
          strategy_version: number;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        Insert: {
          activated_at?: string | null;
          activated_by?: string | null;
          anonymized_check_column?: string;
          created_at?: string;
          entity_type: string;
          field_strategies: Json;
          id?: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active?: boolean;
          jsonb_field_strategies?: Json | null;
          retention_event_column?: string | null;
          status?: string;
          strategy_version?: number;
          table_name: string;
          table_schema: string;
          updated_at?: string;
        };
        Update: {
          activated_at?: string | null;
          activated_by?: string | null;
          anonymized_check_column?: string;
          created_at?: string;
          entity_type?: string;
          field_strategies?: Json;
          id?: string;
          internal_rpc_anonymize?: string;
          internal_rpc_apply?: string;
          is_active?: boolean;
          jsonb_field_strategies?: Json | null;
          retention_event_column?: string | null;
          status?: string;
          strategy_version?: number;
          table_name?: string;
          table_schema?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      anonymization_state: {
        Row: {
          anonymization_reason: string;
          anonymized_at: string;
          audit_reference: string | null;
          created_by: string | null;
          entity_id: string;
          entity_type: string;
          field_mapping_snapshot: Json;
          id: string;
          jsonb_field_mapping_snapshot: Json | null;
          strategy_version: number;
          table_name: string;
          table_schema: string;
        };
        Insert: {
          anonymization_reason: string;
          anonymized_at?: string;
          audit_reference?: string | null;
          created_by?: string | null;
          entity_id: string;
          entity_type: string;
          field_mapping_snapshot: Json;
          id?: string;
          jsonb_field_mapping_snapshot?: Json | null;
          strategy_version: number;
          table_name: string;
          table_schema: string;
        };
        Update: {
          anonymization_reason?: string;
          anonymized_at?: string;
          audit_reference?: string | null;
          created_by?: string | null;
          entity_id?: string;
          entity_type?: string;
          field_mapping_snapshot?: Json;
          id?: string;
          jsonb_field_mapping_snapshot?: Json | null;
          strategy_version?: number;
          table_name?: string;
          table_schema?: string;
        };
        Relationships: [];
      };
      anonymization_strategies: {
        Row: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          function_name: string;
          function_schema: string;
          id: string;
          status: string;
          strategy_name: string;
          updated_at: string;
        };
        Insert: {
          activated_at?: string | null;
          activated_by?: string | null;
          created_at?: string;
          description?: string | null;
          function_name: string;
          function_schema?: string;
          id?: string;
          status?: string;
          strategy_name: string;
          updated_at?: string;
        };
        Update: {
          activated_at?: string | null;
          activated_by?: string | null;
          created_at?: string;
          description?: string | null;
          function_name?: string;
          function_schema?: string;
          id?: string;
          status?: string;
          strategy_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      audit_log_2026_05: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      audit_log_2026_06: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      audit_log_2026_07: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      audit_log_2026_08: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      audit_log_default: {
        Row: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        };
        Insert: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation: string;
          record_id?: string | null;
          schema_version?: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth?: number;
        };
        Update: {
          actor_role?: string | null;
          actor_user_id?: string | null;
          change_reason?: string;
          changed_columns?: string[] | null;
          id?: string;
          new_values?: Json | null;
          occurred_at?: string;
          old_values?: Json | null;
          operation?: string;
          record_id?: string | null;
          schema_version?: number;
          source_type?: string;
          table_name?: string;
          table_schema?: string;
          trigger_depth?: number;
        };
        Relationships: [];
      };
      break_glass_operation_types: {
        Row: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          internal_rpc: string;
          is_active: boolean;
          operation_type: string;
          required_payload_schema: Json | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          activated_at?: string | null;
          activated_by?: string | null;
          created_at?: string;
          description?: string | null;
          display_name: string;
          id?: string;
          internal_rpc: string;
          is_active?: boolean;
          operation_type: string;
          required_payload_schema?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          activated_at?: string | null;
          activated_by?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string;
          id?: string;
          internal_rpc?: string;
          is_active?: boolean;
          operation_type?: string;
          required_payload_schema?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      break_glass_requests: {
        Row: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        };
        Insert: {
          approval_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          executed_at?: string | null;
          executed_by?: string | null;
          expires_at: string;
          id?: string;
          operation_type: string;
          reason: string;
          rejection_reason?: string | null;
          requested_at?: string;
          requested_by: string;
          status?: string;
          target_id: string;
          target_payload?: Json | null;
          updated_at?: string;
        };
        Update: {
          approval_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          executed_at?: string | null;
          executed_by?: string | null;
          expires_at?: string;
          id?: string;
          operation_type?: string;
          reason?: string;
          rejection_reason?: string | null;
          requested_at?: string;
          requested_by?: string;
          status?: string;
          target_id?: string;
          target_payload?: Json | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "break_glass_requests_operation_type_fkey";
            columns: ["operation_type"];
            isOneToOne: false;
            referencedRelation: "break_glass_operation_types";
            referencedColumns: ["operation_type"];
          },
        ];
      };
      cron_heartbeats: {
        Row: {
          consecutive_failure_count: number;
          created_at: string;
          failure_count: number;
          is_enabled: boolean;
          job_name: string;
          last_duration_ms: number | null;
          last_error: string | null;
          last_run_at: string | null;
          last_status: string | null;
          last_successful_run_at: string | null;
          run_count: number;
          schedule: string;
          updated_at: string;
        };
        Insert: {
          consecutive_failure_count?: number;
          created_at?: string;
          failure_count?: number;
          is_enabled?: boolean;
          job_name: string;
          last_duration_ms?: number | null;
          last_error?: string | null;
          last_run_at?: string | null;
          last_status?: string | null;
          last_successful_run_at?: string | null;
          run_count?: number;
          schedule: string;
          updated_at?: string;
        };
        Update: {
          consecutive_failure_count?: number;
          created_at?: string;
          failure_count?: number;
          is_enabled?: boolean;
          job_name?: string;
          last_duration_ms?: number | null;
          last_error?: string | null;
          last_run_at?: string | null;
          last_status?: string | null;
          last_successful_run_at?: string | null;
          run_count?: number;
          schedule?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      data_field_definitions: {
        Row: {
          category: string;
          column_name: string;
          created_at: string;
          id: string;
          match_role: string | null;
          pii_level: string;
          purpose: string;
          retention_type: string | null;
          retention_value: Json | null;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          column_name: string;
          created_at?: string;
          id?: string;
          match_role?: string | null;
          pii_level: string;
          purpose: string;
          retention_type?: string | null;
          retention_value?: Json | null;
          table_name: string;
          table_schema: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          column_name?: string;
          created_at?: string;
          id?: string;
          match_role?: string | null;
          pii_level?: string;
          purpose?: string;
          retention_type?: string | null;
          retention_value?: Json | null;
          table_name?: string;
          table_schema?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      superadmin_settings: {
        Row: {
          created_at: string;
          gdpr_responsible_employee_id: string;
          id: number;
          min_admin_count: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          gdpr_responsible_employee_id: string;
          id: number;
          min_admin_count?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          gdpr_responsible_employee_id?: string;
          id?: number;
          min_admin_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _anon_strategy_blank: {
        Args: { p_entity_id: string; p_value: string };
        Returns: string;
      };
      _anon_strategy_hash: {
        Args: { p_entity_id: string; p_value: string };
        Returns: string;
      };
      _anon_strategy_hash_email: {
        Args: { p_entity_id: string; p_value: string };
        Returns: string;
      };
      anonymization_mapping_activate: {
        Args: { p_change_reason: string; p_mapping_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          anonymized_check_column: string;
          created_at: string;
          entity_type: string;
          field_strategies: Json;
          id: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active: boolean;
          jsonb_field_strategies: Json | null;
          retention_event_column: string | null;
          status: string;
          strategy_version: number;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "anonymization_mappings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymization_mapping_approve: {
        Args: { p_change_reason: string; p_mapping_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          anonymized_check_column: string;
          created_at: string;
          entity_type: string;
          field_strategies: Json;
          id: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active: boolean;
          jsonb_field_strategies: Json | null;
          retention_event_column: string | null;
          status: string;
          strategy_version: number;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "anonymization_mappings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymization_mapping_test_run: {
        Args: { p_change_reason: string; p_mapping_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          anonymized_check_column: string;
          created_at: string;
          entity_type: string;
          field_strategies: Json;
          id: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active: boolean;
          jsonb_field_strategies: Json | null;
          retention_event_column: string | null;
          status: string;
          strategy_version: number;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "anonymization_mappings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymization_mapping_upsert: {
        Args: {
          p_anonymized_check_column: string;
          p_change_reason: string;
          p_entity_type: string;
          p_field_strategies: Json;
          p_internal_rpc_anonymize: string;
          p_internal_rpc_apply: string;
          p_retention_event_column: string;
          p_table_name: string;
          p_table_schema: string;
        };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          anonymized_check_column: string;
          created_at: string;
          entity_type: string;
          field_strategies: Json;
          id: string;
          internal_rpc_anonymize: string;
          internal_rpc_apply: string;
          is_active: boolean;
          jsonb_field_strategies: Json | null;
          retention_event_column: string | null;
          status: string;
          strategy_version: number;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "anonymization_mappings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymization_state_read: {
        Args: {
          p_entity_id?: string;
          p_entity_type?: string;
          p_from?: string;
          p_limit?: number;
          p_to?: string;
        };
        Returns: {
          anonymization_reason: string;
          anonymized_at: string;
          audit_reference: string | null;
          created_by: string | null;
          entity_id: string;
          entity_type: string;
          field_mapping_snapshot: Json;
          id: string;
          jsonb_field_mapping_snapshot: Json | null;
          strategy_version: number;
          table_name: string;
          table_schema: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "anonymization_state";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      anonymization_strategy_activate: {
        Args: { p_change_reason: string; p_strategy_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          function_name: string;
          function_schema: string;
          id: string;
          status: string;
          strategy_name: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "anonymization_strategies";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymize_generic_apply: {
        Args: {
          p_change_reason: string;
          p_entity_id: string;
          p_entity_type: string;
        };
        Returns: Json;
      };
      apply_field_strategy: {
        Args: { p_strategy: string; p_value: string };
        Returns: string;
      };
      audit_filter_values: {
        Args: { p_schema: string; p_table: string; p_values: Json };
        Returns: Json;
      };
      audit_log_read: {
        Args: {
          p_from?: string;
          p_limit?: number;
          p_record_id?: string;
          p_table_name?: string;
          p_table_schema?: string;
          p_to?: string;
        };
        Returns: {
          actor_role: string | null;
          actor_user_id: string | null;
          change_reason: string;
          changed_columns: string[] | null;
          id: string;
          new_values: Json | null;
          occurred_at: string;
          old_values: Json | null;
          operation: string;
          record_id: string | null;
          schema_version: number;
          source_type: string;
          table_name: string;
          table_schema: string;
          trigger_depth: number;
        }[];
        SetofOptions: {
          from: "*";
          to: "audit_log";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      break_glass_approve: {
        Args: { p_approval_notes: string; p_request_id: string };
        Returns: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_execute: {
        Args: { p_request_id: string };
        Returns: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_operation_type_activate: {
        Args: { p_change_reason: string; p_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          internal_rpc: string;
          is_active: boolean;
          operation_type: string;
          required_payload_schema: Json | null;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_operation_types";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_operation_type_approve: {
        Args: { p_change_reason: string; p_id: string };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          internal_rpc: string;
          is_active: boolean;
          operation_type: string;
          required_payload_schema: Json | null;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_operation_types";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_operation_type_upsert: {
        Args: {
          p_change_reason: string;
          p_description: string;
          p_display_name: string;
          p_internal_rpc: string;
          p_operation_type: string;
          p_required_payload_schema: Json;
        };
        Returns: {
          activated_at: string | null;
          activated_by: string | null;
          created_at: string;
          description: string | null;
          display_name: string;
          id: string;
          internal_rpc: string;
          is_active: boolean;
          operation_type: string;
          required_payload_schema: Json | null;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_operation_types";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_reject: {
        Args: { p_rejection_reason: string; p_request_id: string };
        Returns: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_request: {
        Args: {
          p_operation_type: string;
          p_reason: string;
          p_target_id: string;
          p_target_payload: Json;
        };
        Returns: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "break_glass_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      break_glass_requests_read: {
        Args: { p_limit?: number; p_operation_type?: string; p_status?: string };
        Returns: {
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          executed_at: string | null;
          executed_by: string | null;
          expires_at: string;
          id: string;
          operation_type: string;
          reason: string;
          rejection_reason: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          target_id: string;
          target_payload: Json | null;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "break_glass_requests";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      cron_heartbeat_record: {
        Args: {
          p_duration_ms?: number;
          p_error?: string;
          p_job_name: string;
          p_schedule: string;
          p_status: string;
        };
        Returns: undefined;
      };
      cron_heartbeats_export: {
        Args: never;
        Returns: {
          label_job_name: string;
          label_status: string;
          metric: string;
          value: number;
        }[];
      };
      cron_heartbeats_read: {
        Args: never;
        Returns: {
          consecutive_failure_count: number;
          created_at: string;
          failure_count: number;
          is_enabled: boolean;
          job_name: string;
          last_duration_ms: number | null;
          last_error: string | null;
          last_run_at: string | null;
          last_status: string | null;
          last_successful_run_at: string | null;
          run_count: number;
          schedule: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "cron_heartbeats";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      data_field_definition_delete: {
        Args: {
          p_change_reason: string;
          p_column_name: string;
          p_table_name: string;
          p_table_schema: string;
        };
        Returns: undefined;
      };
      data_field_definition_upsert: {
        Args: {
          p_category: string;
          p_change_reason?: string;
          p_column_name: string;
          p_match_role?: string;
          p_pii_level: string;
          p_purpose: string;
          p_retention_type?: string;
          p_retention_value?: Json;
          p_table_name: string;
          p_table_schema: string;
        };
        Returns: {
          category: string;
          column_name: string;
          created_at: string;
          id: string;
          match_role: string | null;
          pii_level: string;
          purpose: string;
          retention_type: string | null;
          retention_value: Json | null;
          table_name: string;
          table_schema: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "data_field_definitions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      ensure_audit_partition: {
        Args: { p_months_ahead?: number };
        Returns: number;
      };
      gdpr_responsible_set: {
        Args: { p_change_reason: string; p_employee_id: string };
        Returns: {
          created_at: string;
          gdpr_responsible_employee_id: string;
          id: number;
          min_admin_count: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "superadmin_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      healthcheck: { Args: never; Returns: Json };
      is_permanent_allowed: {
        Args: {
          p_column_name: string;
          p_table_name: string;
          p_table_schema: string;
        };
        Returns: boolean;
      };
      replay_anonymization: {
        Args: { p_dry_run?: boolean; p_entity_type?: string };
        Returns: Json;
      };
      superadmin_settings_update: {
        Args: { p_change_reason: string; p_min_admin_count: number };
        Returns: {
          created_at: string;
          gdpr_responsible_employee_id: string;
          id: number;
          min_admin_count: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "superadmin_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      verify_anonymization_consistency: { Args: never; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  core_identity: {
    Tables: {
      client_field_definitions: {
        Row: {
          created_at: string;
          display_name: string;
          display_order: number;
          field_type: string;
          id: string;
          is_active: boolean;
          key: string;
          pii_level: string;
          required: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          display_order?: number;
          field_type: string;
          id?: string;
          is_active?: boolean;
          key: string;
          pii_level: string;
          required?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          display_order?: number;
          field_type?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          pii_level?: string;
          required?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_node_placements: {
        Row: {
          applied_at: string;
          client_id: string;
          created_at: string;
          created_by_pending_change_id: string | null;
          effective_from: string;
          effective_to: string | null;
          id: string;
          node_id: string;
          updated_at: string;
        };
        Insert: {
          applied_at?: string;
          client_id: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from: string;
          effective_to?: string | null;
          id?: string;
          node_id: string;
          updated_at?: string;
        };
        Update: {
          applied_at?: string;
          client_id?: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          node_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_node_placements_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_node_placements_created_by_pending_change_id_fkey";
            columns: ["created_by_pending_change_id"];
            isOneToOne: false;
            referencedRelation: "pending_changes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_node_placements_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          created_at: string;
          fields: Json;
          id: string;
          is_active: boolean;
          logo_bytes: string | null;
          logo_content_type: string | null;
          logo_filename: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          fields?: Json;
          id?: string;
          is_active?: boolean;
          logo_bytes?: string | null;
          logo_content_type?: string | null;
          logo_filename?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fields?: Json;
          id?: string;
          is_active?: boolean;
          logo_bytes?: string | null;
          logo_content_type?: string | null;
          logo_filename?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_active_config: {
        Row: {
          created_at: string;
          id: number;
          post_termination_grace_days: number;
          treat_anonymized_as_active: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: number;
          post_termination_grace_days?: number;
          treat_anonymized_as_active?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          post_termination_grace_days?: number;
          treat_anonymized_as_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_node_placements: {
        Row: {
          applied_at: string;
          created_at: string;
          created_by_pending_change_id: string | null;
          effective_from: string;
          effective_to: string | null;
          employee_id: string;
          id: string;
          node_id: string;
          updated_at: string;
        };
        Insert: {
          applied_at?: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from: string;
          effective_to?: string | null;
          employee_id: string;
          id?: string;
          node_id: string;
          updated_at?: string;
        };
        Update: {
          applied_at?: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          employee_id?: string;
          id?: string;
          node_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_node_placements_created_by_pending_change_id_fkey";
            columns: ["created_by_pending_change_id"];
            isOneToOne: false;
            referencedRelation: "pending_changes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_node_placements_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_node_placements_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        Insert: {
          anonymized_at?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          first_name: string;
          hire_date?: string | null;
          id?: string;
          last_name: string;
          role_id?: string | null;
          termination_date?: string | null;
          updated_at?: string;
        };
        Update: {
          anonymized_at?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string;
          hire_date?: string | null;
          id?: string;
          last_name?: string;
          role_id?: string | null;
          termination_date?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_role_id_fk";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      org_node_closure: {
        Row: {
          ancestor_id: string;
          depth: number;
          descendant_id: string;
        };
        Insert: {
          ancestor_id: string;
          depth: number;
          descendant_id: string;
        };
        Update: {
          ancestor_id?: string;
          depth?: number;
          descendant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_node_closure_ancestor_id_fkey";
            columns: ["ancestor_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_node_closure_descendant_id_fkey";
            columns: ["descendant_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
        ];
      };
      org_node_versions: {
        Row: {
          applied_at: string;
          created_at: string;
          created_by_pending_change_id: string | null;
          effective_from: string;
          effective_to: string | null;
          is_active: boolean;
          name: string;
          node_id: string;
          node_type: string;
          parent_id: string | null;
          version_id: string;
        };
        Insert: {
          applied_at?: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from: string;
          effective_to?: string | null;
          is_active: boolean;
          name: string;
          node_id: string;
          node_type: string;
          parent_id?: string | null;
          version_id?: string;
        };
        Update: {
          applied_at?: string;
          created_at?: string;
          created_by_pending_change_id?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          name?: string;
          node_id?: string;
          node_type?: string;
          parent_id?: string | null;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_node_versions_created_by_pending_change_id_fkey";
            columns: ["created_by_pending_change_id"];
            isOneToOne: false;
            referencedRelation: "pending_changes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_node_versions_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_node_versions_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "org_nodes";
            referencedColumns: ["id"];
          },
        ];
      };
      org_nodes: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pending_changes: {
        Row: {
          action_id: string | null;
          applied_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          change_type: string;
          created_at: string;
          effective_from: string;
          id: string;
          payload: Json;
          requested_at: string;
          requested_by: string | null;
          status: string;
          target_id: string | null;
          undo_deadline: string | null;
          undone_at: string | null;
          updated_at: string;
        };
        Insert: {
          action_id?: string | null;
          applied_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          change_type: string;
          created_at?: string;
          effective_from: string;
          id?: string;
          payload: Json;
          requested_at?: string;
          requested_by?: string | null;
          status?: string;
          target_id?: string | null;
          undo_deadline?: string | null;
          undone_at?: string | null;
          updated_at?: string;
        };
        Update: {
          action_id?: string | null;
          applied_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          change_type?: string;
          created_at?: string;
          effective_from?: string;
          id?: string;
          payload?: Json;
          requested_at?: string;
          requested_by?: string | null;
          status?: string;
          target_id?: string | null;
          undo_deadline?: string | null;
          undone_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pending_changes_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "permission_actions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pending_changes_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pending_changes_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      permission_actions: {
        Row: {
          bypass_tab_write: boolean;
          created_at: string;
          has_undo: boolean;
          id: string;
          is_active: boolean;
          name: string;
          requires_second_approver: boolean;
          second_approver_type: string;
          sort_order: number;
          tab_id: string;
          updated_at: string;
        };
        Insert: {
          bypass_tab_write?: boolean;
          created_at?: string;
          has_undo?: boolean;
          id?: string;
          is_active?: boolean;
          name: string;
          requires_second_approver?: boolean;
          second_approver_type?: string;
          sort_order?: number;
          tab_id: string;
          updated_at?: string;
        };
        Update: {
          bypass_tab_write?: boolean;
          created_at?: string;
          has_undo?: boolean;
          id?: string;
          is_active?: boolean;
          name?: string;
          requires_second_approver?: boolean;
          second_approver_type?: string;
          sort_order?: number;
          tab_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permission_actions_tab_id_fkey";
            columns: ["tab_id"];
            isOneToOne: false;
            referencedRelation: "permission_tabs";
            referencedColumns: ["id"];
          },
        ];
      };
      permission_areas: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      permission_pages: {
        Row: {
          area_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          area_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          area_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permission_pages_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "permission_areas";
            referencedColumns: ["id"];
          },
        ];
      };
      permission_tabs: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          page_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          page_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          page_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permission_tabs_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "permission_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      role_page_permissions: {
        Row: {
          can_edit: boolean;
          can_view: boolean;
          created_at: string;
          id: string;
          page_key: string;
          role_id: string;
          scope: string;
          tab_key: string | null;
          updated_at: string;
        };
        Insert: {
          can_edit?: boolean;
          can_view?: boolean;
          created_at?: string;
          id?: string;
          page_key: string;
          role_id: string;
          scope: string;
          tab_key?: string | null;
          updated_at?: string;
        };
        Update: {
          can_edit?: boolean;
          can_view?: boolean;
          created_at?: string;
          id?: string;
          page_key?: string;
          role_id?: string;
          scope?: string;
          tab_key?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_page_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permission_grants: {
        Row: {
          action_id: string | null;
          area_id: string | null;
          can_access: boolean;
          can_write: boolean;
          created_at: string;
          id: string;
          page_id: string | null;
          role_id: string;
          tab_id: string | null;
          updated_at: string;
          visibility: string;
        };
        Insert: {
          action_id?: string | null;
          area_id?: string | null;
          can_access?: boolean;
          can_write?: boolean;
          created_at?: string;
          id?: string;
          page_id?: string | null;
          role_id: string;
          tab_id?: string | null;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          action_id?: string | null;
          area_id?: string | null;
          can_access?: boolean;
          can_write?: boolean;
          created_at?: string;
          id?: string;
          page_id?: string | null;
          role_id?: string;
          tab_id?: string | null;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permission_grants_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "permission_actions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permission_grants_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "permission_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permission_grants_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "permission_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permission_grants_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permission_grants_tab_id_fkey";
            columns: ["tab_id"];
            isOneToOne: false;
            referencedRelation: "permission_tabs";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      undo_settings: {
        Row: {
          change_type: string;
          undo_period_seconds: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          change_type: string;
          undo_period_seconds: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          change_type?: string;
          undo_period_seconds?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "undo_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _anonymize_employee_apply: {
        Args: { p_employee_id: string; p_reason: string; p_strategies: Json };
        Returns: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employees";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      _anonymize_employee_log_state: {
        Args: {
          p_employee_id: string;
          p_reason: string;
          p_strategies: Json;
          p_strategy_version: number;
        };
        Returns: undefined;
      };
      _apply_client_close: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_client_place: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_employee_place: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_employee_remove: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_org_node_deactivate: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_org_node_upsert: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _apply_team_close: {
        Args: { p_payload: Json; p_pending_change_id: string };
        Returns: undefined;
      };
      _org_node_closure_rebuild: { Args: never; Returns: undefined };
      _require_read_permission: {
        Args: { p_page: string; p_tab: string };
        Returns: undefined;
      };
      acl_all: { Args: never; Returns: boolean };
      acl_higher_level_employees: {
        Args: { p_requester_employee_id: string };
        Returns: string[];
      };
      acl_self: { Args: { p_target_employee_id: string }; Returns: boolean };
      acl_subtree_employees: {
        Args: { p_employee_id: string };
        Returns: string[];
      };
      acl_subtree_employees_at: {
        Args: { p_date: string; p_employee_id: string };
        Returns: string[];
      };
      acl_subtree_org_nodes: {
        Args: { p_employee_id: string };
        Returns: string[];
      };
      acl_subtree_org_nodes_at: {
        Args: { p_date: string; p_employee_id: string };
        Returns: string[];
      };
      acl_visibility_check: {
        Args: {
          p_employee_id: string;
          p_target_id: string;
          p_target_kind: string;
          p_visibility: string;
        };
        Returns: boolean;
      };
      anonymize_employee: {
        Args: { p_employee_id: string; p_reason: string };
        Returns: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employees";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      anonymize_employee_internal: {
        Args: { p_employee_id: string; p_reason: string };
        Returns: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employees";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      client_field_definition_set_active: {
        Args: {
          p_change_reason: string;
          p_field_id: string;
          p_is_active: boolean;
        };
        Returns: undefined;
      };
      client_field_definition_upsert: {
        Args: {
          p_change_reason: string;
          p_display_name: string;
          p_display_order?: number;
          p_field_id?: string;
          p_field_type: string;
          p_is_active?: boolean;
          p_key: string;
          p_pii_level: string;
          p_required?: boolean;
        };
        Returns: string;
      };
      client_field_definitions_list: {
        Args: { p_include_inactive?: boolean };
        Returns: {
          created_at: string;
          display_name: string;
          display_order: number;
          field_type: string;
          id: string;
          is_active: boolean;
          key: string;
          pii_level: string;
          required: boolean;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "client_field_definitions";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      client_get: {
        Args: { p_client_id: string };
        Returns: {
          created_at: string;
          fields: Json;
          has_logo: boolean;
          id: string;
          is_active: boolean;
          logo_content_type: string;
          logo_filename: string;
          name: string;
          updated_at: string;
        }[];
      };
      client_list: {
        Args: never;
        Returns: {
          created_at: string;
          has_logo: boolean;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        }[];
      };
      client_logo_clear: {
        Args: { p_change_reason: string; p_client_id: string };
        Returns: undefined;
      };
      client_logo_get: {
        Args: { p_client_id: string };
        Returns: {
          logo_bytes: string;
          logo_content_type: string;
          logo_filename: string;
        }[];
      };
      client_logo_set: {
        Args: {
          p_change_reason: string;
          p_client_id: string;
          p_logo_bytes: string;
          p_logo_content_type: string;
          p_logo_filename: string;
        };
        Returns: undefined;
      };
      client_node_close: {
        Args: { p_client_id: string; p_effective_from: string };
        Returns: string;
      };
      client_node_place: {
        Args: {
          p_client_id: string;
          p_effective_from: string;
          p_node_id: string;
        };
        Returns: string;
      };
      client_placement_read: {
        Args: { p_client_id: string };
        Returns: {
          effective_from: string;
          effective_to: string;
          node_id: string;
          placement_id: string;
        }[];
      };
      client_placement_read_at: {
        Args: { p_client_id: string; p_date: string };
        Returns: {
          effective_from: string;
          effective_to: string;
          node_id: string;
          placement_id: string;
        }[];
      };
      client_set_active: {
        Args: {
          p_change_reason: string;
          p_client_id: string;
          p_is_active: boolean;
        };
        Returns: undefined;
      };
      client_upsert: {
        Args: {
          p_change_reason: string;
          p_client_id?: string;
          p_fields: Json;
          p_is_active?: boolean;
          p_name: string;
        };
        Returns: string;
      };
      current_employee_id: { Args: never; Returns: string };
      employee_active_config_update: {
        Args: {
          p_change_reason: string;
          p_post_termination_grace_days: number;
          p_treat_anonymized_as_active: boolean;
        };
        Returns: {
          created_at: string;
          id: number;
          post_termination_grace_days: number;
          treat_anonymized_as_active: boolean;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employee_active_config";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      employee_place: {
        Args: {
          p_effective_from: string;
          p_employee_id: string;
          p_node_id: string;
        };
        Returns: string;
      };
      employee_placement_read: {
        Args: { p_employee_id: string };
        Returns: {
          effective_from: string;
          effective_to: string;
          node_id: string;
          placement_id: string;
        }[];
      };
      employee_placement_read_at: {
        Args: { p_date: string; p_employee_id: string };
        Returns: {
          effective_from: string;
          effective_to: string;
          node_id: string;
          placement_id: string;
        }[];
      };
      employee_remove_from_node: {
        Args: { p_effective_from: string; p_employee_id: string };
        Returns: string;
      };
      employee_role_assign: {
        Args: { p_employee_id: string; p_role_id: string };
        Returns: undefined;
      };
      employee_role_remove: {
        Args: { p_employee_id: string };
        Returns: undefined;
      };
      employee_terminate: {
        Args: {
          p_change_reason: string;
          p_employee_id: string;
          p_termination_date: string;
        };
        Returns: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employees";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      employee_upsert: {
        Args: {
          p_auth_user_id: string;
          p_change_reason?: string;
          p_email: string;
          p_first_name: string;
          p_hire_date?: string;
          p_id: string;
          p_last_name: string;
          p_role_id?: string;
          p_termination_date?: string;
        };
        Returns: {
          anonymized_at: string | null;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          first_name: string;
          hire_date: string | null;
          id: string;
          last_name: string;
          role_id: string | null;
          termination_date: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "employees";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      has_permission: {
        Args: { p_can_edit?: boolean; p_page_key: string; p_tab_key?: string };
        Returns: boolean;
      };
      has_permission_action: { Args: { p_action_id: string }; Returns: boolean };
      is_active_employee_state: {
        Args: { p_anonymized_at: string; p_termination_date: string };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      is_admin_by_employee_id: {
        Args: { p_employee_id: string };
        Returns: boolean;
      };
      org_node_deactivate: {
        Args: { p_effective_from: string; p_node_id: string };
        Returns: string;
      };
      org_node_upsert: {
        Args: {
          p_effective_from: string;
          p_id: string;
          p_is_active: boolean;
          p_name: string;
          p_node_type: string;
          p_parent_id: string;
        };
        Returns: string;
      };
      org_tree_read: {
        Args: never;
        Returns: {
          is_active: boolean;
          name: string;
          node_id: string;
          node_type: string;
          parent_id: string;
        }[];
      };
      org_tree_read_at: {
        Args: { p_date: string };
        Returns: {
          is_active: boolean;
          name: string;
          node_id: string;
          node_type: string;
          parent_id: string;
        }[];
      };
      pending_change_apply: {
        Args: { p_change_id: string };
        Returns: undefined;
      };
      pending_change_approve: {
        Args: { p_change_id: string };
        Returns: undefined;
      };
      pending_change_eligible_approvers: {
        Args: { p_pending_change_id: string };
        Returns: string[];
      };
      pending_change_request: {
        Args: {
          p_change_type: string;
          p_effective_from: string;
          p_payload: Json;
          p_target_id: string;
        };
        Returns: string;
      };
      pending_change_undo: { Args: { p_change_id: string }; Returns: undefined };
      pending_changes_read: {
        Args: never;
        Returns: {
          action_id: string;
          applied_at: string;
          approved_at: string;
          change_id: string;
          change_type: string;
          effective_from: string;
          requested_at: string;
          status: string;
          target_id: string;
          undo_deadline: string;
        }[];
      };
      permission_action_deactivate: {
        Args: { p_action_id: string };
        Returns: undefined;
      };
      permission_action_set_approver_type: {
        Args: { p_action_id: string; p_type: string };
        Returns: undefined;
      };
      permission_action_upsert: {
        Args: {
          p_id: string;
          p_is_active?: boolean;
          p_name: string;
          p_sort_order?: number;
          p_tab_id: string;
        };
        Returns: string;
      };
      permission_area_deactivate: {
        Args: { p_area_id: string };
        Returns: undefined;
      };
      permission_area_upsert: {
        Args: {
          p_id: string;
          p_is_active?: boolean;
          p_name: string;
          p_sort_order?: number;
        };
        Returns: string;
      };
      permission_elements_read: {
        Args: never;
        Returns: {
          element_id: string;
          is_active: boolean;
          level: string;
          name: string;
          parent_id: string;
          sort_order: number;
        }[];
      };
      permission_page_deactivate: {
        Args: { p_page_id: string };
        Returns: undefined;
      };
      permission_page_upsert: {
        Args: {
          p_area_id: string;
          p_id: string;
          p_is_active?: boolean;
          p_name: string;
          p_sort_order?: number;
        };
        Returns: string;
      };
      permission_resolve: {
        Args: {
          p_element_id: string;
          p_element_type: string;
          p_role_id: string;
        };
        Returns: {
          can_access: boolean;
          can_write: boolean;
          visibility: string;
        }[];
      };
      permission_tab_deactivate: {
        Args: { p_tab_id: string };
        Returns: undefined;
      };
      permission_tab_upsert: {
        Args: {
          p_id: string;
          p_is_active?: boolean;
          p_name: string;
          p_page_id: string;
          p_sort_order?: number;
        };
        Returns: string;
      };
      role_page_permission_upsert: {
        Args: {
          p_can_edit: boolean;
          p_can_view: boolean;
          p_change_reason: string;
          p_page_key: string;
          p_role_id: string;
          p_scope: string;
          p_tab_key: string;
        };
        Returns: {
          can_edit: boolean;
          can_view: boolean;
          created_at: string;
          id: string;
          page_key: string;
          role_id: string;
          scope: string;
          tab_key: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "role_page_permissions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      role_permission_grant_remove: {
        Args: {
          p_element_id: string;
          p_element_type: string;
          p_role_id: string;
        };
        Returns: undefined;
      };
      role_permission_grant_set: {
        Args: {
          p_can_access: boolean;
          p_can_write: boolean;
          p_element_id: string;
          p_element_type: string;
          p_role_id: string;
          p_visibility: string;
        };
        Returns: string;
      };
      role_permissions_read: {
        Args: { p_role_id: string };
        Returns: {
          can_access: boolean;
          can_write: boolean;
          element_id: string;
          element_name: string;
          element_type: string;
          grant_id: string;
          visibility: string;
        }[];
      };
      role_upsert: {
        Args: {
          p_change_reason?: string;
          p_description?: string;
          p_id: string;
          p_name: string;
        };
        Returns: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "roles";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      team_close: {
        Args: { p_effective_from: string; p_node_id: string };
        Returns: string;
      };
      undo_setting_update: {
        Args: { p_change_type: string; p_undo_period_seconds: number };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  core_money: {
    Tables: {
      cancellations: {
        Row: {
          amount: number;
          created_at: string;
          created_by: string | null;
          effekt_dato: string;
          id: string;
          match_id: string | null;
          reason: string;
          reverses_cancellation_id: string | null;
          source: string;
          source_sale_id: string;
          target_period_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          created_by?: string | null;
          effekt_dato: string;
          id?: string;
          match_id?: string | null;
          reason: string;
          reverses_cancellation_id?: string | null;
          source: string;
          source_sale_id: string;
          target_period_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          created_by?: string | null;
          effekt_dato?: string;
          id?: string;
          match_id?: string | null;
          reason?: string;
          reverses_cancellation_id?: string | null;
          source?: string;
          source_sale_id?: string;
          target_period_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cancellations_reverses_cancellation_id_fkey";
            columns: ["reverses_cancellation_id"];
            isOneToOne: false;
            referencedRelation: "cancellations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cancellations_target_period_id_fkey";
            columns: ["target_period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
        ];
      };
      commission_snapshots: {
        Row: {
          amount: number;
          candidate_run_id: string | null;
          created_at: string;
          employee_id: string;
          id: string;
          is_candidate: boolean;
          period_id: string;
          sale_id: string;
          status_at_lock: string;
        };
        Insert: {
          amount: number;
          candidate_run_id?: string | null;
          created_at?: string;
          employee_id: string;
          id?: string;
          is_candidate?: boolean;
          period_id: string;
          sale_id: string;
          status_at_lock: string;
        };
        Update: {
          amount?: number;
          candidate_run_id?: string | null;
          created_at?: string;
          employee_id?: string;
          id?: string;
          is_candidate?: boolean;
          period_id?: string;
          sale_id?: string;
          status_at_lock?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commission_snapshots_candidate_run_id_fkey";
            columns: ["candidate_run_id"];
            isOneToOne: false;
            referencedRelation: "pay_period_candidate_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commission_snapshots_period_id_fkey";
            columns: ["period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_period_candidate_runs: {
        Row: {
          commission_row_count: number;
          computation_duration_ms: number | null;
          correction_row_count: number;
          created_at: string;
          data_checksum: string;
          data_checksum_inputs: Json;
          generated_at: string;
          generated_by: string | null;
          id: string;
          is_current: boolean;
          period_id: string;
        };
        Insert: {
          commission_row_count?: number;
          computation_duration_ms?: number | null;
          correction_row_count?: number;
          created_at?: string;
          data_checksum: string;
          data_checksum_inputs: Json;
          generated_at?: string;
          generated_by?: string | null;
          id?: string;
          is_current?: boolean;
          period_id: string;
        };
        Update: {
          commission_row_count?: number;
          computation_duration_ms?: number | null;
          correction_row_count?: number;
          created_at?: string;
          data_checksum?: string;
          data_checksum_inputs?: Json;
          generated_at?: string;
          generated_by?: string | null;
          id?: string;
          is_current?: boolean;
          period_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pay_period_candidate_runs_period_id_fkey";
            columns: ["period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_period_settings: {
        Row: {
          auto_lock_enabled: boolean;
          created_at: string;
          id: number;
          recommended_lock_date_rule: string;
          start_day_of_month: number;
          updated_at: string;
        };
        Insert: {
          auto_lock_enabled?: boolean;
          created_at?: string;
          id: number;
          recommended_lock_date_rule?: string;
          start_day_of_month?: number;
          updated_at?: string;
        };
        Update: {
          auto_lock_enabled?: boolean;
          created_at?: string;
          id?: number;
          recommended_lock_date_rule?: string;
          start_day_of_month?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      pay_periods: {
        Row: {
          auto_lock_enabled: boolean;
          consecutive_lock_failures: number;
          created_at: string;
          end_date: string;
          id: string;
          last_lock_attempt_at: string | null;
          last_lock_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          start_date: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          auto_lock_enabled?: boolean;
          consecutive_lock_failures?: number;
          created_at?: string;
          end_date: string;
          id?: string;
          last_lock_attempt_at?: string | null;
          last_lock_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          start_date: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          auto_lock_enabled?: boolean;
          consecutive_lock_failures?: number;
          created_at?: string;
          end_date?: string;
          id?: string;
          last_lock_attempt_at?: string | null;
          last_lock_error?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
          start_date?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      salary_corrections: {
        Row: {
          amount: number;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          reason: string;
          source_cancellation_id: string | null;
          source_period_id: string | null;
          source_sale_id: string | null;
          target_period_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          reason: string;
          source_cancellation_id?: string | null;
          source_period_id?: string | null;
          source_sale_id?: string | null;
          target_period_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          reason?: string;
          source_cancellation_id?: string | null;
          source_period_id?: string | null;
          source_sale_id?: string | null;
          target_period_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salary_corrections_source_cancellation_fkey";
            columns: ["source_cancellation_id"];
            isOneToOne: false;
            referencedRelation: "cancellations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "salary_corrections_source_period_id_fkey";
            columns: ["source_period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "salary_corrections_target_period_id_fkey";
            columns: ["target_period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _compute_period_data_checksum: {
        Args: { p_period_id: string };
        Returns: {
          checksum: string;
          inputs: Json;
        }[];
      };
      _pay_period_compute_candidate_internal: {
        Args: { p_change_reason: string; p_period_id: string };
        Returns: {
          commission_row_count: number;
          computation_duration_ms: number | null;
          correction_row_count: number;
          created_at: string;
          data_checksum: string;
          data_checksum_inputs: Json;
          generated_at: string;
          generated_by: string | null;
          id: string;
          is_current: boolean;
          period_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_period_candidate_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      _pay_period_lock_internal: {
        Args: { p_change_reason: string; p_period_id: string };
        Returns: {
          auto_lock_enabled: boolean;
          consecutive_lock_failures: number;
          created_at: string;
          end_date: string;
          id: string;
          last_lock_attempt_at: string | null;
          last_lock_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          start_date: string;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_periods";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_compute_candidate: {
        Args: { p_change_reason: string; p_period_id: string };
        Returns: {
          commission_row_count: number;
          computation_duration_ms: number | null;
          correction_row_count: number;
          created_at: string;
          data_checksum: string;
          data_checksum_inputs: Json;
          generated_at: string;
          generated_by: string | null;
          id: string;
          is_current: boolean;
          period_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_period_candidate_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_compute_candidate_via_cron: {
        Args: { p_period_id: string };
        Returns: {
          commission_row_count: number;
          computation_duration_ms: number | null;
          correction_row_count: number;
          created_at: string;
          data_checksum: string;
          data_checksum_inputs: Json;
          generated_at: string;
          generated_by: string | null;
          id: string;
          is_current: boolean;
          period_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_period_candidate_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_for_date: {
        Args: { p_date: string };
        Returns: {
          end_date: string;
          start_date: string;
        }[];
      };
      pay_period_lock: {
        Args: { p_change_reason: string; p_period_id: string };
        Returns: {
          auto_lock_enabled: boolean;
          consecutive_lock_failures: number;
          created_at: string;
          end_date: string;
          id: string;
          last_lock_attempt_at: string | null;
          last_lock_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          start_date: string;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_periods";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_lock_attempt: { Args: { p_period_id: string }; Returns: Json };
      pay_period_lock_via_cron: {
        Args: { p_period_id: string };
        Returns: {
          auto_lock_enabled: boolean;
          consecutive_lock_failures: number;
          created_at: string;
          end_date: string;
          id: string;
          last_lock_attempt_at: string | null;
          last_lock_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          start_date: string;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_periods";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_settings_update: {
        Args: {
          p_auto_lock_enabled: boolean;
          p_change_reason: string;
          p_recommended_lock_date_rule: string;
          p_start_day_of_month: number;
        };
        Returns: {
          auto_lock_enabled: boolean;
          created_at: string;
          id: number;
          recommended_lock_date_rule: string;
          start_day_of_month: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_period_settings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_period_unlock_via_break_glass: {
        Args: { p_change_reason: string; p_period_id: string };
        Returns: {
          auto_lock_enabled: boolean;
          consecutive_lock_failures: number;
          created_at: string;
          end_date: string;
          id: string;
          last_lock_attempt_at: string | null;
          last_lock_error: string | null;
          locked_at: string | null;
          locked_by: string | null;
          start_date: string;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_periods";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      period_recommended_lock_date: {
        Args: { p_period_id: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      gov1_registry_backup: {
        Row: {
          created_by: string | null;
          idempotency_key: string | null;
          name: string | null;
          rollback: string[] | null;
          statements: string[] | null;
          version: string | null;
        };
        Insert: {
          created_by?: string | null;
          idempotency_key?: string | null;
          name?: string | null;
          rollback?: string[] | null;
          statements?: string[] | null;
          version?: string | null;
        };
        Update: {
          created_by?: string | null;
          idempotency_key?: string | null;
          name?: string | null;
          rollback?: string[] | null;
          statements?: string[] | null;
          version?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      client_assign_to_team: {
        Args: {
          p_change_reason: string;
          p_client_id: string;
          p_from_date?: string;
          p_team_id: string;
        };
        Returns: string;
      };
      client_field_definition_upsert: {
        Args: {
          p_change_reason: string;
          p_display_name: string;
          p_display_order?: number;
          p_field_id?: string;
          p_field_type: string;
          p_is_active?: boolean;
          p_key: string;
          p_match_role?: string;
          p_pii_level: string;
          p_required?: boolean;
        };
        Returns: string;
      };
      client_upsert: {
        Args: {
          p_change_reason: string;
          p_client_id?: string;
          p_fields: Json;
          p_name: string;
        };
        Returns: string;
      };
      data_field_definition_upsert: {
        Args: {
          p_category: string;
          p_change_reason?: string;
          p_column_name: string;
          p_match_role?: string;
          p_pii_level: string;
          p_purpose: string;
          p_retention_type?: string;
          p_retention_value?: Json;
          p_table_name: string;
          p_table_schema: string;
        };
        Returns: string;
      };
      employee_assign_to_team: {
        Args: {
          p_change_reason: string;
          p_employee_id: string;
          p_from_date?: string;
          p_team_id: string;
        };
        Returns: string;
      };
      employee_upsert: {
        Args: {
          p_auth_user_id: string;
          p_change_reason: string;
          p_email: string;
          p_employee_id?: string;
          p_first_name: string;
          p_hire_date: string;
          p_last_name: string;
          p_termination_date?: string;
        };
        Returns: string;
      };
      org_unit_upsert: {
        Args: {
          p_change_reason: string;
          p_is_active?: boolean;
          p_name: string;
          p_org_unit_id?: string;
          p_parent_id?: string;
        };
        Returns: string;
      };
      role_page_permission_upsert: {
        Args: {
          p_can_edit: boolean;
          p_can_view: boolean;
          p_change_reason: string;
          p_page_key: string;
          p_role_id: string;
          p_scope: string;
          p_tab_key?: string;
        };
        Returns: string;
      };
      role_upsert: {
        Args: {
          p_change_reason: string;
          p_description?: string;
          p_name: string;
          p_role_id?: string;
        };
        Returns: string;
      };
      team_upsert: {
        Args: {
          p_change_reason: string;
          p_is_active?: boolean;
          p_name: string;
          p_org_unit_id: string;
          p_team_id?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  core_compliance: {
    Enums: {},
  },
  core_identity: {
    Enums: {},
  },
  core_money: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
