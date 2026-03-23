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

export default async function Home() {
  const data = await getAllBlogs();
  const allBlogs = data?.blogs || [];

  const heroBlog = allBlogs[0];
  const featuredBlogs = allBlogs.slice(1, 4);
  const latestBlogs = allBlogs.slice(4, 13);

  const categoryMap = allBlogs.reduce((acc, blog) => {
    const category = blog.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="pb-20">

      {/* ── Hero Slider ────────────────────────────────── */}
      {heroBlog ? (
        <section className="relative">
          <div className="relative h-[420px] overflow-hidden md:h-[500px]">
            <Image
              src={resolveImage(heroBlog, 0)}
              alt={heroBlog.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute inset-0 flex items-end">
              <div className="container-shell pb-10 md:pb-14">
                <span className={`inline-block rounded-md px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${badgeColors[0]}`}>
                  {heroBlog.category || 'General'}
                </span>
                <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-[42px] md:leading-[1.15]">
                  <Link href={`/blog/${heroBlog.slug}`} className="transition hover:text-[#3858F6]">
                    {heroBlog.title}
                  </Link>
                </h1>
                <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3858F6] text-xs font-bold text-white">
                    {(heroBlog.author?.name || 'A')[0]}
                  </div>
                  <span className="font-semibold text-white">{heroBlog.author?.name || 'Admin'}</span>
                  <span className="text-white/50">|</span>
                  <span>{new Date(heroBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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

      {/* ── Featured Side-Cards ────────────────────────── */}
      <section className="container-shell mt-12">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827] md:text-[28px]">
              Featured Reads
              <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
            </h2>
          </div>
          <Link href="/blog" className="flex items-center gap-1 text-sm font-bold text-[#3858F6] transition hover:text-black">
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredBlogs.length ? (
            featuredBlogs.map((blog, index) => (
              <article key={blog._id} className="group overflow-hidden rounded-xl bg-white shadow-[0_0_4px_#cfcfcf] transition-shadow duration-300 hover:shadow-[0_0_20px_#cfcfcf]">
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={resolveImage(blog, index + 1)}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeColors[(index + 1) % badgeColors.length]}`}>
                    {blog.category || 'General'}
                  </span>
                </div>
                <div className="border-b-[3px] border-[#3858F6] p-5">
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#111827] transition group-hover:text-[#3858F6]">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <div className="mt-3 flex items-center gap-3 text-xs text-[#7B7F84]">
                    <span className="font-semibold text-[#334155]">{blog.author?.name || 'Admin'}</span>
                    <span>·</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
              Trending Categories
              <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topCategories.map(([name, count], idx) => (
              <Link
                key={name}
                href={`/blog?category=${encodeURIComponent(name)}`}
                className="group flex flex-col items-center rounded-[20px] bg-white p-5 shadow-[0_0_4px_#cfcfcf] transition hover:shadow-[0_0_20px_#cfcfcf]"
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
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">

          {/* Latest Articles */}
          <div>
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

            <div className="grid gap-5 sm:grid-cols-2">
              {latestBlogs.length ? (
                latestBlogs.map((blog, index) => (
                  <article key={blog._id} className="group overflow-hidden rounded-xl bg-white shadow-[0_0_4px_#cfcfcf] transition-shadow duration-300 hover:shadow-[0_0_20px_#cfcfcf]">
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      <Image
                        src={resolveImage(blog, index + 2)}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${badgeColors[index % badgeColors.length]}`}>
                        {blog.category || 'General'}
                      </span>
                    </div>
                    <div className="border-b-[3px] border-[#3858F6] p-4">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#111827] transition group-hover:text-[#3858F6]">
                        <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#7B7F84]">
                        <span className="font-semibold text-[#334155]">{blog.author?.name || 'Admin'}</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
                  No recent posts found.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

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

