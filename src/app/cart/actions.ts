"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addToCart, getCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart";

export type CartActionState = { error?: string } | null;

export async function addLine(_prev: CartActionState, formData: FormData): Promise<CartActionState> {
  const variantId = String(formData.get("variantId") ?? "");
  if (!variantId.startsWith("gid://shopify/ProductVariant/")) return { error: "That item couldn't be added." };
  try {
    await addToCart(variantId, 1);
  } catch {
    return { error: "We couldn't add that just now. Please try again." };
  }
  revalidatePath("/cart");
  redirect("/cart");
}

export async function setQuantity(formData: FormData): Promise<void> {
  const lineId = String(formData.get("lineId") ?? "");
  const quantity = Math.max(0, Math.min(10, Number(formData.get("quantity") ?? 1)));
  if (!lineId) return;
  await updateCartLine(lineId, quantity).catch(() => null);
  revalidatePath("/cart");
}

export async function removeLine(formData: FormData): Promise<void> {
  const lineId = String(formData.get("lineId") ?? "");
  if (!lineId) return;
  await removeCartLine(lineId).catch(() => null);
  revalidatePath("/cart");
}

/** Hand off to Shopify's hosted checkout. The only payment flow on the site. */
export async function checkout(): Promise<void> {
  const cart = await getCart();
  if (!cart || cart.lines.length === 0) redirect("/cart");
  redirect(cart.checkoutUrl);
}
