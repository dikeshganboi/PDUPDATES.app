'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAdminBlogs, deleteAdminBlog } from '../../../lib/adminBlogApi';
import { useAuth } from '../../../context/AuthContext';
import { formatDate } from '../../../utils/formatDate';
import Button from '../../../components/ui/Button';
import SectionHeader from '../../../components/ui/SectionHeader';

export default function ManageBlogsPage() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await fetchAdminBlogs(token);
        setBlogs(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadBlogs();
    }
  }, [token]);

  const handleDelete = async (id) => {
    const approved = window.confirm('Are you sure you want to delete this blog?');
    if (!approved) return;

    try {
      setDeletingId(id);
      await deleteAdminBlog(id, token);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      toast.success('Blog deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]">
          <SectionHeader
            eyebrow="Content"
            title="Manage Blogs"
            subtitle="Edit, review, and remove existing posts from one place."
          />
        </div>
        <Button href="/admin/create-blog">
          + New Blog
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_0_4px_#cfcfcf]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F8F8F8] text-left text-[#334155]">
            <tr>
              <th className="px-4 py-3 font-bold">Title</th>
              <th className="px-4 py-3 font-bold">Category</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Views</th>
              <th className="px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`loading-${index}`} className="border-t border-gray-100">
                  <td className="px-4 py-4" colSpan={5}>
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  </td>
                </tr>
              ))
            )}

            {!loading && blogs.length === 0 && (
              <tr>
                <td className="px-4 py-5 text-[#7B7F84]" colSpan={5}>
                  No blogs found.
                </td>
              </tr>
            )}

            {blogs.map((blog) => (
              <tr key={blog._id} className="border-t border-gray-100 transition hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-bold text-[#111827]">{blog.title}</td>
                <td className="px-4 py-3 text-[#7B7F84]">
                  <span className="inline-flex rounded-md bg-[#3858F6] px-2 py-1 text-xs font-bold text-white">
                    {blog.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#7B7F84]">{formatDate(blog.createdAt)}</td>
                <td className="px-4 py-3 text-[#7B7F84]">{blog.views || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button href={`/admin/edit-blog/${blog._id}`} variant="secondary" className="px-3 py-1.5 text-xs">
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleDelete(blog._id)}
                      disabled={deletingId === blog._id}
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                    >
                      {deletingId === blog._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
