const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchJson = async (url, options = {}) => {
  const {
    fallbackData = null,
    allowFallbackOnNetworkError = false,
    ...requestOptions
  } = options;

  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(requestOptions.headers || {}),
      },
      next: {
        revalidate: 60,
        ...(requestOptions.next || {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Request failed: ${response.status} ${body}`);
    }

    return response.json();
  } catch (error) {
    if (allowFallbackOnNetworkError && fallbackData) {
      return fallbackData;
    }

    throw error;
  }
};

export const getAllBlogs = async ({ search = '', category = '', tag = '' } = {}) => {
  const params = new URLSearchParams();

  if (search?.trim()) params.set('search', search.trim());
  if (category?.trim()) params.set('category', category.trim());
  if (tag?.trim()) params.set('tag', tag.trim());

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/blogs?${queryString}` : `${API_BASE_URL}/blogs`;

  return fetchJson(url, {
    allowFallbackOnNetworkError: true,
    fallbackData: { count: 0, blogs: [] },
  });
};

export const getBlogBySlug = async (slug) => {
  return fetchJson(`${API_BASE_URL}/blogs/${slug}`, {
    next: { revalidate: 30 },
  });
};

export const getRelatedBlogs = async (slug, limit = 3) => {
  return fetchJson(`${API_BASE_URL}/blogs/${slug}/related?limit=${limit}`, {
    allowFallbackOnNetworkError: true,
    fallbackData: { blogs: [] },
    next: { revalidate: 60 },
  });
};
