import api from './api';

export const fetchCommentsByBlog = async (blogId) => {
  const response = await api.get(`/comments/${blogId}`);
  return response.data;
};

export const fetchCommentsByBlogPaged = async (blogId, page = 1, limit = 10) => {
  const response = await api.get(`/comments/${blogId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchCommentsByBlogCursor = async (blogId, cursor = null, limit = 10) => {
  const params = new URLSearchParams({ mode: 'cursor', limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await api.get(`/comments/${blogId}?${params.toString()}`);
  return response.data;
};

export const addCommentToBlog = async (payload, token) => {
  const response = await api.post('/comments', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteCommentById = async (commentId, token) => {
  const response = await api.delete(`/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const toggleBlogLike = async (blogId, token) => {
  const response = await api.post(
    `/blogs/${blogId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const searchUsersForMentions = async (query, token) => {
  if (!query?.trim()) return { users: [] };

  const response = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
