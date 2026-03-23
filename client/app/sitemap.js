const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap() {
  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let blogRoutes = [];

  try {
    const res = await fetch(`${API_BASE_URL}/blogs?limit=100`, { next: { revalidate: 3600 } });

    if (res.ok) {
      const data = await res.json();
      blogRoutes = (data.blogs || []).map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch {
    // Sitemap still returns static routes if API is unavailable
  }

  return [...staticRoutes, ...blogRoutes];
}
