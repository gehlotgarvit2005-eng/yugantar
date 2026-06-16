import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const ALLOWED_ADMINS = [
  "sourabhsinghtak.2207@gmail.com",
  "gehlotgarvit2005@gmail.com",
];

/**
 * Validates whether the incoming request contains a valid Supabase token
 * belonging to one of the authorized admin emails.
 */
export async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("Authorization") || request.headers.get("x-admin-token");
  
  if (!authHeader) {
    return { error: "Authentication token is required.", user: null };
  }

  // Handle standard Bearer token prefixes
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return { error: error?.message || "Invalid session token.", user: null };
    }

    if (!user.email || !ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
      return { error: "Access denied: Unauthorized administrator email.", user: null };
    }

    return { error: null, user };
  } catch (err) {
    console.error("Admin verification error:", err);
    return { error: "Failed to authenticate session token.", user: null };
  }
}
