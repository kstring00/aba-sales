export type Money = { amount: string; currencyCode: string };

export type Image = { url: string; altText: string | null; width: number | null; height: number | null };

export type ProductSummary = {
  id: string;
  handle: string;
  title: string;
  /** One-line benefit; from the `custom.benefit` metafield or the first description sentence. */
  benefit: string;
  featuredImage: Image | null;
  price: Money;
  compareAtPrice: Money | null;
  tags: string[];
  availableForSale: boolean;
  /** `custom.shelf` metafield: get-organized | make-a-plan | everyday-life | support-at-home */
  shelf?: string | null;
};

export type ProductDetail = ProductSummary & {
  descriptionHtml: string;
  description: string;
  images: Image[];
  variantId: string;
  /** From the `custom.format` metafield: e.g. "PDF, 24 pages, US Letter" */
  format: string | null;
  /** From the `custom.included` metafield: newline-separated list */
  included: string[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: ProductSummary[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productHandle: string;
  image: Image | null;
  price: Money;
  lineTotal: Money;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
};
