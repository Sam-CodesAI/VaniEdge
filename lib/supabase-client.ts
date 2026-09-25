import { createClient } from "@supabase/supabase-js";

// We'll use the local Supabase URLs injected by the CLI or fallback to standard local defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnNvbmFsLXdvcmtzcGFjZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NDM2MDM2LCJleHAiOjIwMjUwMTE2MzZ9.placeholder-key-for-local-dev";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
