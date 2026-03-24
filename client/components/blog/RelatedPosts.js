import Link from 'next/link';
import Image from 'next/image';
import { getRelatedBlogs } from '../../lib/blogApi';
import { formatDate } from '../../utils/formatDate';

const RelatedPosts = async ({ slug }) => {
  const { blogs } = await getRelatedBlogs(slug, 3);

  if (!blogs?.length) return null;

  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-8" style={{ borderBottom: '3px solid #3858F6' }}>
      <h2 className="mb-6 text-lg font-extrabold text-[#111827]">You Might Also Like</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((post) => {
          const imageUrl = post.image?.trim()
            ? post.image
            : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80';

          const readTime = post.content
            ? Math.ceil(post.content.split(' ').length / 200)
            : null;

          return (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl border border-gray-100 transition hover:shadow-md"
            >
              <div className="relative h-36 bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded bg-[#3858F6] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {post.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-[#111827] group-hover:text-[#3858F6]">
                  {post.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7B7F84]">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span>👁️ {post.views || 0}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedPosts;
