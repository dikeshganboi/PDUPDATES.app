import { notFound } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { getBlogBySlug } from '../../../lib/blogApi';
import { formatDate } from '../../../utils/formatDate';
import BlogEngagement from '../../../components/blog/BlogEngagement';
import Breadcrumb from '../../../components/ui/Breadcrumb';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const blog = await getBlogBySlug(slug);
    const description = blog.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '';

    return {
      title: blog.title,
      description,
      openGraph: {
        title: blog.title,
        description,
        type: 'article',
        url: `${siteUrl}/blog/${slug}`,
        publishedTime: blog.createdAt,
        authors: [blog.author?.name || 'PD Updates'],
        tags: blog.tags || [],
        ...(blog.image && {
          images: [{ url: blog.image, width: 1200, height: 630, alt: blog.title }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description,
        ...(blog.image && { images: [blog.image] }),
      },
    };
  } catch {
    return {
      title: 'Blog Not Found',
    };
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    notFound();
  }

  const readingTime = blog.content
    ? Math.ceil(blog.content.split(' ').length / 200)
    : 5;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: blog.title },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
    image: blog.image || undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'PD Updates',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PD Updates',
    },
    url: `${siteUrl}/blog/${slug}`,
    keywords: blog.tags?.join(', ') || '',
  };

  return (
    <article className="container-shell max-w-5xl py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Article Header */}
      <header className="mb-8 rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-8" style={{ borderBottom: '3px solid #3858F6' }}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-md bg-[#FF3385] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
            {blog.category}
          </span>
          <span className="text-xs font-bold text-[#7B7F84]">⏱️ {readingTime} min read</span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[#111827] md:text-[42px] md:leading-[1.15]">
          {blog.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3858F6] text-sm font-bold text-white">
              {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">{blog.author?.name || 'Admin'}</p>
              <p className="text-xs text-[#7B7F84]">{formatDate(blog.createdAt)}</p>
            </div>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-[#7B7F84]">👁️ {blog.views || 0} views</span>
        </div>
      </header>

      {/* Featured Image */}
      {blog.image && (
        <div className="mb-8 overflow-hidden rounded-xl shadow-[0_0_20px_#cfcfcf]">
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div
        className="content-html mb-8 rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-8 prose prose-lg max-w-none prose-headings:text-[#111827] prose-headings:font-extrabold prose-p:text-[#334155] prose-a:text-[#3858F6] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || '') }}
      />

      <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Tags Section */}
      {!!blog.tags?.length && (
        <section className="mb-8 rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#111827]">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <a
                key={tag}
                href={`/blog?tag=${tag}`}
                className="inline-flex items-center gap-1 rounded-md bg-[#3858F6] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#111827]"
              >
                #<span>{tag}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Author Card */}
      {blog.author && (
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_0_4px_#cfcfcf] md:p-8">
          {blog.author.avatar ? (
            <Image
              src={blog.author.avatar}
              alt={blog.author.name || 'Author'}
              width={96}
              height={96}
              className="mx-auto h-24 w-24 rounded-full border-4 border-[#3858F6]/10 object-cover"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#3858F6]/10 bg-[#3858F6] text-2xl font-bold text-white">
              {blog.author.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <h3 className="mt-4 text-lg font-extrabold text-[#111827]">{blog.author.name || 'Author'}</h3>
          {blog.author.bio && (
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#7B7F84]">
              {blog.author.bio}
            </p>
          )}
        </section>
      )}

      {/* Engagement Section */}
      <BlogEngagement blog={blog} />
    </article>
  );
}
