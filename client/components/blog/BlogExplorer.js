'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BlogList from '../BlogList';
import CategoriesSidebar from '../CategoriesSidebar';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_CATEGORIES = ['Tech', 'Jobs', 'Guides'];
const PAGE_SIZE = 9;

const buildUrlWithFilters = (pathname, search, category, page) => {
  const params = new URLSearchParams();

  if (search?.trim()) params.set('search', search.trim());
  if (category?.trim()) params.set('category', category.trim());
  if (page > 1) params.set('page', String(page));
  params.set('limit', String(PAGE_SIZE));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
};

const BlogExplorer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);

  const [blogs, setBlogs] = useState([]);
  const [categoryFacets, setCategoryFacets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const userTypingRef = useRef(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync state from URL params when navigating from Navbar or external links
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));

    if (urlSearch !== debouncedSearch) {
      setSearchInput(urlSearch);
      setDebouncedSearch(urlSearch);
      userTypingRef.current = false;
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const nextUrl = buildUrlWithFilters(pathname, debouncedSearch, selectedCategory, page);
    router.replace(nextUrl, { scroll: false });

    const fetchBlogs = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (debouncedSearch?.trim()) params.set('search', debouncedSearch.trim());
        if (selectedCategory?.trim()) params.set('category', selectedCategory.trim());
        params.set('page', String(page));
        params.set('limit', String(PAGE_SIZE));

        const query = params.toString();
        const endpoint = query ? `${API_BASE_URL}/blogs?${query}` : `${API_BASE_URL}/blogs`;

        const response = await fetch(endpoint, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        setBlogs(data.blogs || []);
        setCategoryFacets(data.categoryFacets || []);
        setPagination(
          data.pagination || {
            page,
            limit: PAGE_SIZE,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: page > 1,
          }
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load blogs');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [debouncedSearch, selectedCategory, page, pathname, router]);

  useEffect(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2 || !userTypingRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/blogs/suggestions?q=${encodeURIComponent(searchInput.trim())}`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Suggestion fetch failed');
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categories = useMemo(() => {
    const fromFacets = categoryFacets.map((item) => item.category).filter(Boolean);
    const merged = new Set([...DEFAULT_CATEGORIES, ...fromFacets]);
    return ['All', ...Array.from(merged)];
  }, [categoryFacets]);

  const sidebarCategories = useMemo(
    () => categoryFacets.map((facet) => ({ name: facet.category, count: facet.count })),
    [categoryFacets]
  );

  const showNoResults = !loading && !error && blogs.length === 0;
  const hasFilters = Boolean(debouncedSearch || selectedCategory);

  // Close suggestions on click outside search box
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setPage(1);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = useCallback((suggestion) => {
    if (suggestion.type === 'tag') {
      setSearchInput(suggestion.value);
      setDebouncedSearch(suggestion.value);
    } else {
      setSearchInput(suggestion.value);
      setDebouncedSearch(suggestion.value);
    }

    setPage(1);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, []);

  const removeSearchChip = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  const removeCategoryChip = () => {
    setSelectedCategory('');
    setPage(1);
  };

  return (
    <section className="min-h-screen py-8 md:py-10">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Discover"
          title="Explore Blog Library"
          subtitle="Find posts by topic, keyword, and category with a clean editorial browsing experience."
        />

        <div className="mt-7 grid gap-8 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="rounded-xl bg-white p-4 shadow-[0_0_4px_#cfcfcf] md:p-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="relative" ref={searchBoxRef}>
                  <label htmlFor="blog-search" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7B7F84]">
                    Search Blogs
                  </label>
                  <input
                    id="blog-search"
                    type="text"
                    value={searchInput}
                    onChange={(event) => {
                      userTypingRef.current = true;
                      setSearchInput(event.target.value);
                      setPage(1);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => {
                      if (suggestions.length) setShowSuggestions(true);
                    }}
                    placeholder="Search title, content, or tags..."
                    className="input-premium"
                    suppressHydrationWarning
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
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
                          <span className="flex-1 truncate">{highlightMatch(item.value, searchInput)}</span>
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

                <Button type="button" onClick={clearFilters} variant="secondary" className="h-fit" suppressHydrationWarning>
                  Clear Filters
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = (category === 'All' && !selectedCategory) || category === selectedCategory;
                  const value = category === 'All' ? '' : category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(value);
                        setPage(1);
                      }}
                      suppressHydrationWarning
                      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#3858F6] text-white shadow-md'
                          : 'bg-[#F8F8F8] text-[#334155] hover:bg-[#3858F6] hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {hasFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {!!debouncedSearch && (
                    <button
                      type="button"
                      onClick={removeSearchChip}
                      className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Search: {debouncedSearch}
                      <span aria-hidden="true">x</span>
                    </button>
                  )}

                  {!!selectedCategory && (
                    <button
                      type="button"
                      onClick={removeCategoryChip}
                      className="inline-flex items-center gap-2 rounded-full bg-[#3858F6] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Category: {selectedCategory}
                      <span aria-hidden="true">x</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              {loading && (
                <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="skeleton-shimmer overflow-hidden rounded-xl bg-white p-4 shadow-[0_0_4px_#cfcfcf]">
                      <div className="h-44 rounded-lg bg-gray-200" />
                      <div className="mt-4 h-3 w-24 rounded bg-gray-200" />
                      <div className="mt-2 h-5 w-10/12 rounded bg-gray-200" />
                      <div className="mt-2 h-4 w-7/12 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {showNoResults && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-[#F8F8F8] p-10 text-center text-[#7B7F84]">
                  No results found. Try a different keyword or clear filters.
                </div>
              )}

              {!loading && !error && blogs.length > 0 && <BlogList blogs={blogs} />}

              {!loading && !error && pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-[#334155] shadow-[0_0_4px_#cfcfcf] md:flex-row">
                  <p>
                    Page {pagination.page} of {pagination.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrevPage}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <CategoriesSidebar categories={sidebarCategories} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogExplorer;
