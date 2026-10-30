import { cookies } from "next/headers";
import { storefront, ShopifyError } from "./client";
import { CART_CREATE, CART_LINES_ADD, CART_LINES_REMOVE, CART_LINES_UPDATE, CART_QUERY } from "./queries";
import { toCart, type RawCart } from "./normalize";
import type { Cart } from "./types";

/**
 * Cart lives in Shopify; we hold only its id in an httpOnly cookie.
 * Checkout is a redirect to cart.checkoutUrl — Shopify hosts payment.
 */
export const CART_COOKIE = "ss_cart";
/** Readable mirror of totalQuantity so statically rendered pages can show the badge client-side. */
export const CART_QTY_COOKIE = "ss_cart_qty";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 14,
};

type UserError = { field: string[] | null; message: string };

async function rememberQty(cart: Cart | null) {
  const store = await cookies();
  if (!cart || cart.totalQuantity === 0) store.set(CART_QTY_COOKIE, "0", { ...COOKIE_OPTS, httpOnly: false });
  else store.set(CART_QTY_COOKIE, String(cart.totalQuantity), { ...COOKIE_OPTS, httpOnly: false });
}

function assertNoErrors(errors: UserError[] | undefined) {
  if (errors && errors.length) throw new ShopifyError(errors.map((e) => e.message).join("; "), 200, errors);
}

export async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function getCart(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    const data = await storefront<{ cart: RawCart | null }>(CART_QUERY, { id }, { revalidate: false });
    return data.cart ? toCart(data.cart) : null;
  } catch {
    return null;
  }
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<Cart> {
  const id = await getCartId();
  const lines = [{ merchandiseId, quantity }];
  let raw: RawCart | null = null;
  if (id) {
    const data = await storefront<{ cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] } }>(
      CART_LINES_ADD,
      { cartId: id, lines },
      { revalidate: false },
    );
    assertNoErrors(data.cartLinesAdd.userErrors);
    raw = data.cartLinesAdd.cart;
  }
  if (!raw) {
    const data = await storefront<{ cartCreate: { cart: RawCart | null; userErrors: UserError[] } }>(CART_CREATE, { lines }, { revalidate: false });
    assertNoErrors(data.cartCreate.userErrors);
    raw = data.cartCreate.cart;
    if (!raw) throw new ShopifyError("Cart could not be created");
    const store = await cookies();
    store.set(CART_COOKIE, raw.id, COOKIE_OPTS);
  }
  const cart = toCart(raw);
  await rememberQty(cart);
  return cart;
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  if (quantity <= 0) return removeCartLine(lineId);
  const data = await storefront<{ cartLinesUpdate: { cart: RawCart | null; userErrors: UserError[] } }>(
    CART_LINES_UPDATE,
    { cartId: id, lines: [{ id: lineId, quantity }] },
    { revalidate: false },
  );
  assertNoErrors(data.cartLinesUpdate.userErrors);
  const cart = data.cartLinesUpdate.cart ? toCart(data.cartLinesUpdate.cart) : null;
  await rememberQty(cart);
  return cart;
}

export async function removeCartLine(lineId: string): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  const data = await storefront<{ cartLinesRemove: { cart: RawCart | null; userErrors: UserError[] } }>(
    CART_LINES_REMOVE,
    { cartId: id, lineIds: [lineId] },
    { revalidate: false },
  );
  assertNoErrors(data.cartLinesRemove.userErrors);
  const cart = data.cartLinesRemove.cart ? toCart(data.cartLinesRemove.cart) : null;
  await rememberQty(cart);
  return cart;
}

export async function clearCartCookie() {
  const store = await cookies();
  store.delete(CART_COOKIE);
  store.delete(CART_QTY_COOKIE);
}
