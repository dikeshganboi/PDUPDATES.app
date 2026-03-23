'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdminBlogForm from '../../../components/admin/AdminBlogForm';
import { createAdminBlog } from '../../../lib/adminBlogApi';
import { useAuth } from '../../../context/AuthContext';
import SectionHeader from '../../../components/ui/SectionHeader';

export default function CreateBlogPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      await createAdminBlog(payload, token);
      toast.success('Blog published successfully');
      router.push('/admin/manage-blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <SectionHeader
          eyebrow="Create"
          title="Create Blog"
          subtitle="Write and publish a new post for your audience."
        />
      </div>

      <AdminBlogForm mode="create" submitting={submitting} onSubmit={handleCreate} />
    </section>
  );
}
