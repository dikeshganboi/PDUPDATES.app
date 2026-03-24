import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogs } from '../lib/blogApi';

const fallbackImages = [
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
];

const badgeColors = [
  'bg-[#FF3385] text-white',
  'bg-[#FFAF25] text-white',
  'bg-[#2A67F7] text-white',
  'bg-[#FF3D00] text-white',
];

const resolveImage = (blog, index = 0) => {
  if (blog?.image?.trim()) return blog.image;
  return fallbackImages[index % fallbackImages.length];
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getReadTime = (content) => {
  if (!content) return 1;
  return Math.max(1, Math.ceil(stripHtml(content).split(/\s+/).length / 200));
};

const getCategories = (blog) =>
  (Array.isArray(blog.category) ? blog.category : [blog.category].filter(Boolean)).slice(0, 3);

const AuthorAvatar = ({ author, size = 'sm' }) => {
  const sizeClass = size === 'lg' ? 'h-10 w-10 text-sm' : 'h-7 w-7 text-[10px]';
  if (author?.avatar) {
    return (
      <Image
        src={author.avatar}
        alt={author.name || 'Author'}
        width={size === 'lg' ? 40 : 28}
        height={size === 'lg' ? 40 : 28}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-[#3858F6] font-bold text-white`}>
      {(author?.name || 'A')[0].toUpperCase()}
    </div>
  );
};

export default async function Home() {
  const data = await getAllBlogs();
  const allBlogs = data?.blogs || [];

  const heroBlog = allBlogs[0];
  const featuredBlogs = allBlogs.slice(1, 4);
  const latestBlogs = allBlogs.slice(4, 13);

  // Popular posts sorted by views for sidebar
  const popularBlogs = [...allBlogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const categoryMap = allBlogs.reduce((acc, blog) => {
    const cats = Array.isArray(blog.category) ? blog.category : [blog.category].filter(Boolean);
    for (const cat of cats) {
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="pb-20">

      {/* ── Hero ────────────────────────────────────────── */}
      {heroBlog ? (
        <section className="relative">
          <div className="relative h-[440px] overflow-hidden md:h-[520px]">
            <Image
              src={resolveImage(heroBlog, 0)}
              alt={heroBlog.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
            <div className="absolute inset-0 flex items-end">
              <div className="container-shell pb-10 md:pb-14">
                <div className="flex flex-wrap items-center gap-2">
                  {getCategories(heroBlog).map((cat, i) => (
                    <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} className={`inline-block rounded-md px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition hover:opacity-80 ${badgeColors[i % badgeColors.length]}`}>
                      {cat}
                    </Link>
                  ))}
                  <span className="ml-1 flex items-center gap-1 text-xs text-white/60">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {getReadTime(heroBlog.content)} min read
                  </span>
                </div>
                <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-[42px] md:leading-[1.15]">
                  <Link href={`/blog/${heroBlog.slug}`} className="transition hover:text-[#3858F6]">
                    {heroBlog.title}
                  </Link>
                </h1>
                <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70 md:text-[15px]">
                  {stripHtml(heroBlog.content).substring(0, 160)}…
                </p>
                <div className="mt-5 flex items-center gap-3 text-sm text-white/80">
                  <AuthorAvatar author={heroBlog.author} size="lg" />
                  <div className="leading-tight">
                    <span className="font-semibold text-white">{heroBlog.author?.name || 'Admin'}</span>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{new Date(heroBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      {heroBlog.views > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {heroBlog.views}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="container-shell pt-10">
          <div className="flex h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-[#F8F8F8] text-gray-400">
            No featured post yet.
          </div>
        </section>
      )}

      {/* ── Featured Reads ─────────────────────────────── */}
      <section className="container-shell mt-12">
        <div className="mb-7 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-[#111827] md:text-[28px]">
            Featured Reads
            <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
          </h2>
          <Link href="/blog" className="flex items-center gap-1 text-sm font-bold text-[#3858F6] transition hover:text-black">
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredBlogs.length ? (
            featuredBlogs.map((blog, index) => (
              <article key={blog._id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_0_4px_#cfcfcf] transition-shadow duration-300 hover:shadow-[0_0_20px_#cfcfcf]">
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={resolveImage(blog, index + 1)}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                    {getCategories(blog).map((cat, ci) => (
                      <span key={cat} className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeColors[(index + 1 + ci) % badgeColors.length]}`}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col border-b-[3px] border-[#3858F6] p-5">
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#111827] transition group-hover:text-[#3858F6]">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#7B7F84]">
                    {stripHtml(blog.content).substring(0, 120)}…
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs text-[#7B7F84]">
                    <div className="flex items-center gap-2">
                      <AuthorAvatar author={blog.author} />
                      <span className="font-semibold text-[#334155]">{blog.author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {getReadTime(blog.content)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {blog.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-3 rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
              No featured articles yet.
            </div>
          )}
        </div>
      </section>

      {/* ── Trending Categories ────────────────────────── */}
      {topCategories.length > 0 && (
        <section className="container-shell mt-14">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-[#111827] md:text-[28px]">
              Explore Topics
              <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topCategories.map(([name, count], idx) => (
              <Link
                key={name}
                href={`/blog?category=${encodeURIComponent(name)}`}
                className="group flex flex-col items-center rounded-2xl bg-white p-5 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf] hover:-translate-y-0.5"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${badgeColors[idx % badgeColors.length].split(' ')[0]}`}>
                  {name[0]}
                </div>
                <span className="mt-3 text-sm font-bold text-[#111827] group-hover:text-[#3858F6]">{name}</span>
                <span className="mt-0.5 text-xs text-[#7B7F84]">{count} {count === 1 ? 'post' : 'posts'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Latest + Sidebar ───────────────────────────── */}
      <section className="container-shell mt-14">
        <div className="grid gap-8 xl:grid-cols-[1fr_340px]" style={{ minWidth: 0 }}>

          {/* Latest Articles */}
          <div className="min-w-0">
            <div className="mb-7 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold text-[#111827] md:text-[28px]">
                Latest Articles
                <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
              </h2>
              <Link href="/blog" className="flex items-center gap-1 text-sm font-bold text-[#3858F6] transition hover:text-black">
                Browse archive
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            <div className="space-y-5">
              {latestBlogs.length ? (
                latestBlogs.map((blog, index) => (
                  <article key={blog._id} className="group flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-xl bg-white p-4 shadow-[0_0_4px_#cfcfcf] transition-shadow duration-300 hover:shadow-[0_0_20px_#cfcfcf]">
                    <div className="relative h-44 sm:h-32 w-full sm:w-44 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={resolveImage(blog, index + 2)}
                        alt={blog.title}
                        fill
                        sizes="176px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {getCategories(blog).map((cat, ci) => (
                            <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition hover:opacity-80 ${badgeColors[(index + ci) % badgeColors.length]}`}>
                              {cat}
                            </Link>
                          ))}
                        </div>
                        <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-[#111827] transition group-hover:text-[#3858F6]">
                          <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#7B7F84]">
                          {stripHtml(blog.content).substring(0, 130)}…
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7B7F84]">
                        <div className="flex items-center gap-2">
                          <AuthorAvatar author={blog.author} />
                          <span className="font-semibold text-[#334155]">{blog.author?.name || 'Admin'}</span>
                          <span>·</span>
                          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {getReadTime(blog.content)} min
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {blog.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {blog.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
                  No recent posts found.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:block space-y-6">

            {/* Popular Posts */}
            {popularBlogs.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[#111827]">
                  <svg className="h-5 w-5 text-[#FF3385]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  Popular Posts
                </h3>
                <div className="space-y-4">
                  {popularBlogs.map((blog, idx) => (
                    <Link key={blog._id} href={`/blog/${blog.slug}`} className="group flex items-start gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#F8F8F8] text-sm font-black text-[#3858F6] group-hover:bg-[#3858F6] group-hover:text-white transition">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-[#111827] transition group-hover:text-[#3858F6]">
                          {blog.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#7B7F84]">
                          <span>{blog.author?.name || 'Admin'}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            {blog.views || 0}
                          </span>
                          <span>·</span>
                          <span>{getReadTime(blog.content)} min read</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
              <h3 className="mb-4 text-lg font-extrabold text-[#111827]">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {topCategories.length ? (
                  topCategories.map(([name, count]) => (
                    <Link
                      key={name}
                      href={`/blog?category=${encodeURIComponent(name)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F8F8] px-3.5 py-2 text-xs font-bold text-[#334155] transition hover:bg-[#3858F6] hover:text-white"
                    >
                      {name}
                      <span className="rounded-full bg-[#3858F6] px-1.5 py-0.5 text-[10px] font-bold text-white">{count}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[#7B7F84]">Topics appear once content is published.</p>
                )}
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-xl bg-[#111827] p-6" style={{ borderBottom: '3px solid #3858F6' }}>
              <h3 className="text-lg font-extrabold text-white">PD Updates Digest</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Get the best writing, career, and engineering insights every week.
              </p>
              <form className="mt-4 space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-full border-none bg-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#3858F6]"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#3858F6] py-3 text-sm font-bold text-white transition hover:bg-black"
                  suppressHydrationWarning
                >
                  Subscribe — It&apos;s free
                </button>
              </form>
            </div>

          </aside>
        </div>
      </section>

    </div>
  );
}

