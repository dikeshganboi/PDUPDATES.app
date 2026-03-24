'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminBlogForm from '../../../../components/admin/AdminBlogForm';
import { fetchAdminBlogById, updateAdminBlog } from '../../../../lib/adminBlogApi';
import { useAuth } from '../../../../context/AuthContext';
import SectionHeader from '../../../../components/ui/SectionHeader';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const data = await fetchAdminBlogById(params.id, token);
        setBlog(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && token) {
      loadBlog();
    }
  }, [params.id, token]);

  const initialValues = useMemo(() => {
    if (!blog) return null;

    return {
      title: blog.title || '',
      category: Array.isArray(blog.category) ? blog.category : blog.category ? [blog.category] : [],
      tags: (blog.tags || []).join(', '),
      image: blog.image || '',
      content: blog.content || '',
    };
  }, [blog]);

  const handleUpdate = async (payload) => {
    try {
      setSubmitting(true);
      await updateAdminBlog(params.id, payload, token);
      toast.success('Blog updated successfully');
      router.push('/admin/manage-blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update blog');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-[#7B7F84] shadow-[0_0_4px_#cfcfcf]">
        Loading blog details...
      </div>
    );
  }

  if (!blog) {
    return <div className="text-[#334155]">Blog not found.</div>;
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <SectionHeader
          eyebrow="Edit"
          title="Edit Blog"
          subtitle="Update content and publish the latest version."
        />
      </div>

      <AdminBlogForm
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        onSubmit={handleUpdate}
      />
    </section>
  );
}
