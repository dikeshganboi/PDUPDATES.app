'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiFilePlus, FiFolder, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/create-blog', label: 'Create Blog', icon: FiFilePlus },
  { href: '/admin/manage-blogs', label: 'Manage Blogs', icon: FiFolder },
  { href: '/admin/profile', label: 'My Profile', icon: FiUser },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full border-b border-[#111827] bg-[#111827] text-white md:h-screen md:w-72 md:border-b-0 md:border-r md:border-r-[#1f2937]">
      <div className="flex h-full flex-col gap-6 p-5 md:p-6">
        <div className="rounded-xl border border-[#1f2937] bg-[#1a2332] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Admin Panel</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            PD Updates <span className="text-[#3858F6]">Studio</span>
          </h2>
          <p className="mt-2 truncate text-sm text-gray-400">{user?.email}</p>
        </div>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#3858F6] text-white'
                    : 'text-gray-300 hover:bg-[#1a2332] hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-[#1f2937] px-3 py-2.5 text-sm font-bold text-gray-300 transition hover:border-[#3858F6] hover:bg-[#1a2332]"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
