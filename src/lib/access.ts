import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CaregiverRole } from "@/lib/database.types";

/**
 * Server-side authorization checks used by actions and routes before any
 * write. RLS enforces the same rules in the database; this layer gives clear
 * errors and lets us refuse early.
 */
export async function getChildRole(childId: string): Promise<CaregiverRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("child_caregivers")
    .select("role")
    .eq("child_id", childId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role ?? null;
}

export async function assertChildAccess(childId: string) {
  const role = await getChildRole(childId);
  if (!role) throw new AccessError("You don't have access to this child.");
  return role;
}

export async function assertChildOwner(childId: string) {
  const role = await getChildRole(childId);
  if (role !== "owner") throw new AccessError("Only the owner can do that.");
  return role;
}

export class AccessError extends Error {
  readonly code = "ACCESS_DENIED";
}
