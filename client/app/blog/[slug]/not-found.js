import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-6">
      <h2 className="text-3xl font-bold text-ink">Blog Not Found</h2>
      <p className="mt-2 text-ink/70">The article you are looking for does not exist or has been removed.</p>
      <Link href="/blog" className="mt-6 inline-flex rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream hover:bg-coral">
        Back to Blogs
      </Link>
    </div>
  );
}
