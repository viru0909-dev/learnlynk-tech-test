/**
 * LearnLynk Technical Assessment - Edge Function: create-task
 * 
 * POST endpoint to create a new task with validation
 * 
 * Input:
 * {
 *   "application_id": "uuid",
 *   "task_type": "call",
 *   "due_at": "2025-01-01T12:00:00Z"
 * }
 * 
 * Returns:
 * - Success: { "success": true, "task_id": "..." }
 * - Validation error: 400
 * - Internal error: 500
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTaskRequest {
  application_id: string;
  task_type: string;
  due_at: string;
}

interface CreateTaskResponse {
  success: boolean;
  task_id?: string;
  error?: string;
}

// Valid task types
const VALID_TASK_TYPES = ["call", "email", "review"];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: CreateTaskRequest = await req.json();
    const { application_id, task_type, due_at } = body;

    // ========================================================================
    // VALIDATION
    // ========================================================================

    // Validate required fields
    if (!application_id || !task_type || !due_at) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: application_id, task_type, due_at",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate task_type
    if (!VALID_TASK_TYPES.includes(task_type)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid task_type. Must be one of: ${VALID_TASK_TYPES.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate due_at is a valid timestamp
    const dueAtDate = new Date(due_at);
    if (isNaN(dueAtDate.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid due_at timestamp format",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate due_at is in the future
    const now = new Date();
    if (dueAtDate <= now) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "due_at must be a future timestamp",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate application_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(application_id)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid application_id format (must be UUID)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ========================================================================
    // DATABASE INSERTION
    // ========================================================================

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, verify the application exists and get its tenant_id
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, tenant_id")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      console.error("Application not found:", appError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Application not found",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the task
    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        application_id,
        type: task_type,
        due_at: due_at,
        tenant_id: application.tenant_id,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !task) {
      console.error("Error inserting task:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create task",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ========================================================================
    // REALTIME BROADCAST EVENT
    // ========================================================================
    // Emit a Supabase Realtime broadcast event as per assessment requirement
    try {
      await supabase.channel('tasks')
        .send({
          type: 'broadcast',
          event: 'task.created',
          payload: {
            task_id: task.id,
            application_id,
            task_type,
            due_at,
            created_at: new Date().toISOString(),
          },
        });
    } catch (broadcastError) {
      // Log broadcast error but don't fail the request
      console.error("Realtime broadcast error:", broadcastError);
    }

    // ========================================================================
    // SUCCESS RESPONSE
    // ========================================================================

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
