'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="mt-20">

      {/* Main footer – black background */}
      <div className="bg-black text-gray-400">
        <div className="container-shell pb-12 pt-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3858F6] text-lg font-black text-white">
                  PD
                </span>
                <div className="leading-none">
                  <p className="text-xl font-extrabold text-white">PD Updates</p>
                  <span className="text-[11px] font-medium text-gray-500">by Priyaa</span>
                </div>
              </div>
              <p className="mt-5 max-w-[280px] text-sm leading-relaxed text-gray-500">
                Your go-to source for the latest jobs, deals &amp; career updates. Stay updated. Stay ahead.
              </p>
              {/* Social icons */}
              <div className="mt-5 flex items-center gap-3">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-[#3858F6] hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.38 4.482A13.944 13.944 0 011.671 3.149a4.916 4.916 0 001.523 6.574 4.897 4.897 0 01-2.229-.616v.061a4.919 4.919 0 003.946 4.827 4.996 4.996 0 01-2.224.084 4.917 4.917 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.945 13.945 0 007.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.425-.014-.636A10.025 10.025 0 0024 4.557z" /></svg>
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-[#3858F6] hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-[#3858F6] hover:text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li><Link href="/blog" className="transition hover:text-white">All Articles</Link></li>
                <li><Link href="/blog?category=Tech" className="transition hover:text-white">Tech</Link></li>
                <li><Link href="/blog?category=Jobs" className="transition hover:text-white">Jobs</Link></li>
                <li><Link href="/blog?category=Guides" className="transition hover:text-white">Guides</Link></li>
                {isAdmin && (
                  <>
                    <li><Link href="/admin" className="transition hover:text-white">Admin Dashboard</Link></li>
                    <li><Link href="/admin/create-blog" className="transition hover:text-white">Create Post</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white">Newsletter</h4>
              <p className="mt-5 text-sm text-gray-500">Get one weekly email with practical articles and insights.</p>
              <form className="mt-4 flex">
                <input
                  type="email"
                  placeholder="Email address"
                  suppressHydrationWarning
                  className="min-w-0 flex-1 rounded-l-full border-none bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#3858F6]"
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="rounded-r-full bg-[#3858F6] px-5 text-sm font-bold text-white transition hover:bg-white hover:text-black"
                >
                  Join
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright bar – blue background like WordPress */}
      <div className="bg-[#3858F6] py-4">
        <div className="container-shell flex flex-col items-center justify-between gap-2 text-sm text-white/90 sm:flex-row">
          <p>© {new Date().getFullYear()} PD Updates. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="transition hover:text-white">Privacy</Link>
            <Link href="/" className="transition hover:text-white">Terms</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
