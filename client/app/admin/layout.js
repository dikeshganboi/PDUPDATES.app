'use client';

import AdminGuard from '../../components/admin/AdminGuard';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f3f4f6] md:flex">
        <div className="md:sticky md:top-0 md:h-screen">
          <AdminSidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
