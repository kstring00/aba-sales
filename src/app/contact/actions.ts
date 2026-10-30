"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(1).max(4000),
  // Honeypot: real people leave it empty.
  website: z.string().max(0).optional(),
});

export type ContactState = { ok?: true; error?: string } | null;

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) return { error: "Please check your email and message." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("contact_messages").insert({
    email: parsed.data.email,
    message: parsed.data.message,
    user_id: user?.id ?? null,
  });
  if (error) return { error: "We couldn't send that just now. Please try again shortly." };
  return { ok: true };
}
