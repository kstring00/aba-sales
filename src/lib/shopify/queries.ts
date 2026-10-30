export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_SUMMARY_FRAGMENT = /* GraphQL */ `
  fragment ProductSummaryFields on Product {
    id
    handle
    title
    description(truncateAt: 160)
    tags
    availableForSale
    featuredImage {
      ...ImageFields
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    benefit: metafield(namespace: "custom", key: "benefit") {
      value
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection($handle: String!, $first: Int = 48) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, sortKey: MANUAL) {
        edges {
          node {
            ...ProductSummaryFields
          }
        }
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductSummaryFields
      descriptionHtml
      images(first: 12) {
        edges {
          node {
            ...ImageFields
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
          }
        }
      }
      format: metafield(namespace: "custom", key: "format") {
        value
      }
      included: metafield(namespace: "custom", key: "included") {
        value
      }
      seo {
        title
        description
      }
      collections(first: 3) {
        edges {
          node {
            handle
          }
        }
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query ProductHandles($first: Int = 100) {
    products(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              image {
                ...ImageFields
              }
              product {
                title
                handle
                featuredImage {
                  ...ImageFields
                }
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;
