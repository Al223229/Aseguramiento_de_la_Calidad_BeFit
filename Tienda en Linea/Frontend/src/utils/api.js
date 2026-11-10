const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const API_ENDPOINTS = {
  PRODUCTS: "/api/v1/products/",
  PRODUCT_DETAIL: (productId) => `/api/v1/products/${productId}`,
  PRODUCT_RELATED: (productId, limit = 6) =>
    `/api/v1/products/${productId}/related?limit=${limit}`,
  CATEGORIES: "/api/v1/categories",
  CHECKOUT_VALIDATE: "/api/v1/checkout/validate",
};

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : data.message || `Error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const searchProducts = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return apiFetch(`${API_ENDPOINTS.PRODUCTS}${qs ? `?${qs}` : ""}`);
};

export const getProductDetail = (productId) =>
  apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(productId));

export const getRelatedProducts = (productId, limit = 6) =>
  apiFetch(API_ENDPOINTS.PRODUCT_RELATED(productId, limit));

export const getCategories = () => apiFetch(API_ENDPOINTS.CATEGORIES);

export const getAvailableFilters = async () => {
  const data = await getCategories();
  const categories = Array.isArray(data) ? data : data?.categories || [];
  return {
    categories: categories
      .map((item) => {
        if (typeof item === "string") return { label: item, value: item };
        const label = item.label || item.name || item.value;
        const value = item.value || item.name || item.label;
        return label && value ? { label, value } : null;
      })
      .filter(Boolean),
  };
};

export const validateCheckoutCart = (items) =>
  apiFetch(API_ENDPOINTS.CHECKOUT_VALIDATE, {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
      })),
    }),
  });


