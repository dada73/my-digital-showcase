import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

/**
 * One-time bootstrap: creates the very first admin account.
 * Refuses to run once any admin already exists.
 */
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    // Refuse if an admin already exists
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) {
      throw new Error("Admin already exists. Sign in instead.");
    }

    // Create the auth user (auto-confirmed)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? "Failed to create user");

    // Grant admin role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) {
      // best-effort cleanup
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(roleErr.message);
    }

    return { ok: true, email: data.email };
  });

/**
 * Tells the client whether bootstrap is still available
 * (i.e. no admin exists yet).
 */
export const adminBootstrapStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return { needsBootstrap: (count ?? 0) === 0 };
});
