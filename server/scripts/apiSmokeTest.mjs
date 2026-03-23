const base = 'http://localhost:5000/api';

const parseJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${base}${path}`, options);
  const body = await parseJson(response);

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return body;
};

const run = async () => {
  console.log('1) GET /api/test');
  const test = await request('/test');
  console.log(test);

  const adminEmail = `admin_${Date.now()}@example.com`;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'TestPass@12345';
  const setupKey = process.env.ADMIN_SETUP_KEY || 'your_admin_setup_key';

  console.log('2) POST /api/auth/register (admin)');
  const registered = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Primary Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      adminSetupKey: setupKey,
    }),
  });
  console.log({ email: registered.email, role: registered.role });

  console.log('3) POST /api/auth/login');
  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const token = login.token;
  console.log({ role: login.role, tokenLength: token?.length || 0 });

  console.log('4) POST /api/blogs (admin only)');
  const created = await request('/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'How to Crack Backend Interviews in 2026',
      content: 'Detailed guide for backend interview prep.',
      category: 'Jobs',
      tags: ['backend', 'interview', 'jobs'],
      image: 'https://example.com/interview.jpg',
    }),
  });
  console.log({ id: created._id, slug: created.slug, authorRole: created.author?.role });

  console.log('5) GET /api/blogs');
  const allBlogs = await request('/blogs');
  console.log({ count: allBlogs.count });

  console.log('6) GET /api/blogs/:slug');
  const single = await request(`/blogs/${created.slug}`);
  console.log({ slug: single.slug, views: single.views });

  console.log('7) PUT /api/blogs/:id (admin only)');
  const updated = await request(`/blogs/${created._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'How to Crack Backend Interviews Fast in 2026',
      tags: ['backend', 'jobs', 'system-design'],
    }),
  });
  console.log({ newSlug: updated.slug, tags: updated.tags });

  console.log('8) DELETE /api/blogs/:id (admin only)');
  const deleted = await request(`/blogs/${created._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(deleted);

  console.log('API smoke test completed successfully.');
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
