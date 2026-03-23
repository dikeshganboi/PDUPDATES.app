'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminBlogs } from '../../lib/adminBlogApi';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import SectionHeader from '../../components/ui/SectionHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';

export default function AdminPage() {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await fetchAdminBlogs(token);
        setBlogs(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadBlogs();
    }
  }, [token]);

  const stats = useMemo(() => {
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const avgViews = blogs.length > 0 ? Math.round(totalViews / blogs.length) : 0;
    const thisMonth = blogs.filter(
      (blog) => new Date(blog.createdAt).getMonth() === new Date().getMonth()
    ).length;

    return { totalViews, avgViews, thisMonth };
  }, [blogs]);

  const latest = blogs[0];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Welcome Header */}
      <header className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-8" style={{ borderBottom: '3px solid #3858F6' }}>
        <SectionHeader
          eyebrow="Control Center"
          title={`Welcome back, ${user?.name || 'Admin'}!`}
          subtitle="Manage content, monitor performance, and track engagement metrics."
        />
      </header>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Published */}
        <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B7F84]">Total Published</p>
              <p className="mt-3 text-4xl font-extrabold text-[#111827]">{loading ? '...' : blogs.length}</p>
              <p className="mt-1 text-xs text-[#7B7F84]">All-time posts</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#3858F6] text-sm font-bold text-white">
              POST
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B7F84]">Total Views</p>
              <p className="mt-3 text-4xl font-extrabold text-[#111827]">{loading ? '...' : stats.totalViews.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#7B7F84]">Across all posts</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF3385] text-sm font-bold text-white">
              VIEW
            </div>
          </div>
        </div>

        {/* Average Views per Post */}
        <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B7F84]">Avg. Views</p>
              <p className="mt-3 text-4xl font-extrabold text-[#111827]">{loading ? '...' : stats.avgViews}</p>
              <p className="mt-1 text-xs text-[#7B7F84]">Per article</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFAF25] text-sm font-bold text-white">
              RATE
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B7F84]">This Month</p>
              <p className="mt-3 text-4xl font-extrabold text-[#111827]">{loading ? '...' : stats.thisMonth}</p>
              <p className="mt-1 text-xs text-[#7B7F84]">Posts published</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A67F7] text-sm font-bold text-white">
              DATE
            </div>
          </div>
        </div>
      </div>

      {/* Latest Post Section */}
      {latest && (
        <div className="rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-8" style={{ borderBottom: '3px solid #3858F6' }}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#7B7F84]">Latest Post</h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h3 className="line-clamp-2 text-2xl font-extrabold text-[#111827]">{latest.title}</h3>
              <p className="mt-2 text-sm text-[#7B7F84]">
                Published {formatDate(latest.createdAt)} • {latest.views || 0} views
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex rounded-md bg-[#3858F6] px-3 py-1.5 text-xs font-bold text-white">
                  {latest.category || 'Uncategorized'}
                </span>
              </div>
            </div>
            <Button href={`/admin/edit-blog/${latest._id}`} className="mt-4 md:mt-0">
              Edit Post
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button href="/admin/create-blog" className="h-16 text-base font-bold">
          Create New Post
        </Button>
        <Button href="/admin/manage-blogs" variant="secondary" className="h-16 text-base font-bold">
          Manage All Posts
        </Button>
      </div>
    </section>
  );
}
