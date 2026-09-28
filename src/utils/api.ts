export const fetchProducts = async (query = '') => {
  const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const fetchProduct = async (id: string) => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
};

export const fetchReviews = async (productId: string) => {
  const res = await fetch(`/api/reviews/${productId}`);
  return res.json();
};
