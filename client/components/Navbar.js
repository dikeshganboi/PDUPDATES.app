'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blogs' },
  { href: '/admin', label: 'Admin', adminOnly: true },
];

const isLinkActive = (pathname, href) => {
  const [pathOnly] = href.split('?');
  if (pathOnly === '/') return pathname === '/';
  return pathname.startsWith(pathOnly);
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [today, setToday] = useState('');
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsTimerRef = useRef(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }));
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll and close on Escape when mobile sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const onEscape = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
      document.addEventListener('keydown', onEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onEscape);
      };
    }
    document.body.style.overflow = '';
    return undefined;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', onClickOutside);
      return () => document.removeEventListener('mousedown', onClickOutside);
    }

    return undefined;
  }, [isUserMenuOpen]);

  const userInitials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  // Fetch suggestions as user types (220ms debounce)
  useEffect(() => {
    if (!searchText.trim() || searchText.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionsTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/blogs/suggestions?q=${encodeURIComponent(searchText.trim())}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(suggestionsTimerRef.current);
  }, [searchText]);

  // Close suggestions on click outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/login');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const next = searchText.trim();
    setShowSuggestions(false);
    setSuggestions([]);
    if (!next) {
      router.push('/blog');
      return;
    }
    router.push(`/blog?search=${encodeURIComponent(next)}`);
  };

  const selectSuggestion = useCallback((item) => {
    setSearchText(item.value);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
    router.push(`/blog?search=${encodeURIComponent(item.value)}`);
  }, [router]);

  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-[#3858F6]/15 text-[#3858F6] rounded-sm">{part}</mark>
        : part
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Blue topbar – matches WordPress */}
      <div className="hidden bg-[#3858F6] md:block">
        <div className="container-shell flex items-center justify-between py-2.5">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-medium text-white/90">{today}</span>
            <span className="h-4 w-px bg-white/30" />
            <span className="text-[13px] font-medium text-white/90">Welcome to PD Updates</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/blog?category=Tech" className="text-[12px] font-semibold uppercase tracking-wide text-white/80 transition hover:text-white">Tech</Link>
            <Link href="/blog?category=Jobs" className="text-[12px] font-semibold uppercase tracking-wide text-white/80 transition hover:text-white">Jobs</Link>
            <Link href="/blog?category=Guides" className="text-[12px] font-semibold uppercase tracking-wide text-white/80 transition hover:text-white">Guides</Link>
          </div>
        </div>
      </div>

      {/* Middle header – logo + search */}
      <div className="border-b border-gray-100 bg-white py-4">
        <div className="container-shell flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3858F6] text-lg font-black text-white shadow-lg shadow-[#3858F6]/25">
              PD
            </span>
            <div className="leading-none">
              <p className="text-xl font-extrabold tracking-tight text-[#111827]">PD Updates</p>
              <span className="text-[11px] font-medium text-[#7B7F84]">by Priyaa</span>
            </div>
          </Link>

          {/* Search bar – desktop with autocomplete */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md lg:flex" ref={searchRef}>
            <div className="relative w-full">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                placeholder="Search articles…"
                className="h-11 w-full rounded-full border-none bg-[#F8F8F8] pl-11 pr-4 text-sm text-[#111827] outline-none placeholder:text-[#7B7F84] transition focus:ring-2 focus:ring-[#3858F6]/30"
              />
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                  {suggestions.map((item, index) => (
                    <button
                      key={`${item.type}-${item.value}-${index}`}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                        index === activeIndex
                          ? 'bg-[#3858F6]/5 text-[#3858F6]'
                          : 'text-[#111827] hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5 shrink-0 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.type === 'tag' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        )}
                      </svg>
                      <span className="flex-1 truncate">{highlightMatch(item.value, searchText)}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'tag'
                          ? 'bg-[#FF3385]/10 text-[#FF3385]'
                          : 'bg-[#3858F6]/10 text-[#3858F6]'
                      }`}>
                        {item.type}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-[#7B7F84]">
                    <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium">↑↓</kbd> navigate
                    <span className="mx-2">·</span>
                    <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium">Enter</kbd> select
                    <span className="mx-2">·</span>
                    <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium">Esc</kbd> close
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Icon buttons */}
            <Link href="/blog" className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#F8F8F8] text-[#334155] transition hover:bg-gray-200 md:flex">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </Link>

            {!user ? (
              <Link href="/login" className="hidden items-center rounded-full bg-[#3858F6] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-black md:inline-flex">
                Sign in
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3858F6] text-sm font-bold text-white shadow-md transition hover:bg-[#2a45c9]"
                >
                  {userInitials}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#111827]">{user.name}</p>
                      <p className="truncate text-xs text-[#7B7F84]">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block rounded-full bg-[#3858F6]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3858F6]">Admin</span>
                      )}
                    </div>
                    <div className="p-1.5">
                      {isAdmin && (
                        <>
                          <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-gray-50">
                            <svg className="h-4 w-4 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Dashboard
                          </Link>
                          <Link href="/admin/manage-blogs" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-gray-50">
                            <svg className="h-4 w-4 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Manage Posts
                          </Link>
                          <Link href="/admin/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-gray-50">
                            <svg className="h-4 w-4 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            My Profile
                          </Link>
                        </>
                      )}
                      <Link href="/blog" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-gray-50">
                        <svg className="h-4 w-4 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" /></svg>
                        Browse Blogs
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 p-1.5">
                      <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dark navigation bar – matches WordPress #111827 header */}
      <div className={`bg-[#111827] transition-shadow duration-200 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="container-shell flex items-center justify-between py-0">
          {/* Hamburger – mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            aria-label="Toggle menu"
            suppressHydrationWarning
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>

          {/* Nav links */}
          <nav className="hidden items-center gap-0 md:flex">
            {navLinks.filter((l) => !l.adminOnly || isAdmin).map((link) => {
              const active = isLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={`px-6 py-4 text-[15px] font-bold capitalize transition-colors ${
                    active
                      ? 'bg-[#3858F6] text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side – small search on dark bar for mobile/tablet */}
          <form onSubmit={handleSearchSubmit} className="flex items-center lg:hidden">
            <div className="relative">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search…"
                suppressHydrationWarning
                className="h-9 w-40 rounded-full bg-[#F8F8F8] pl-8 pr-3 text-xs text-[#111827] outline-none placeholder:text-[#7B7F84]"
              />
              <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </form>

          {/* Auth on dark bar */}
          <div className="hidden items-center gap-3 md:flex">
            {!user && (
              <Link href="/login" className="text-[13px] font-semibold text-white/80 transition hover:text-white">Login</Link>
            )}
            {!user && (
              <Link href="/register" className="rounded-full bg-[#3858F6] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-white hover:text-[#111827]">Register</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[70] flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3858F6] text-sm font-black text-white">PD</span>
            <div className="leading-none">
              <p className="text-base font-extrabold text-[#111827]">PD Updates</p>
              <span className="text-[10px] font-medium text-[#7B7F84]">by Priyaa</span>
            </div>
          </Link>
          {user && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3858F6] text-xs font-bold text-white">
              {userInitials}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search articles…"
              className="h-10 w-full rounded-full border border-gray-200 bg-[#F8F8F8] pl-9 pr-4 text-sm placeholder:text-[#7B7F84] outline-none focus:ring-2 focus:ring-[#3858F6]/30"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B7F84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navLinks.filter((l) => !l.adminOnly || isAdmin).map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition ${
                  active
                    ? 'bg-[#3858F6] text-white'
                    : 'text-[#111827] hover:bg-gray-50'
                }`}
              >
                {link.label === 'Home' && (
                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                )}
                {link.label === 'Blogs' && (
                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" /></svg>
                )}
                {link.label === 'Admin' && (
                  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom auth section */}
        <div className="border-t border-gray-100 px-5 py-4">
          {!user ? (
            <div className="flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl bg-[#3858F6] py-3 text-sm font-bold text-white transition hover:bg-black">
                Sign in
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl border border-gray-200 py-3 text-sm font-bold text-[#111827] transition hover:bg-gray-50">
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign out
            </button>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Navbar;
