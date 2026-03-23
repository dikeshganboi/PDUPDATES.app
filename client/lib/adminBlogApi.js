import api from './api';

export const fetchAdminBlogs = async (token) => {
  const response = await api.get('/blogs', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.blogs || [];
};

export const fetchAdminBlogById = async (id, token) => {
  const response = await api.get(`/blogs/id/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createAdminBlog = async (payload, token) => {
  const response = await api.post('/blogs', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const updateAdminBlog = async (id, payload, token) => {
  const response = await api.put(`/blogs/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const deleteAdminBlog = async (id, token) => {
  const response = await api.delete(`/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
