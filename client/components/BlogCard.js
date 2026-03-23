import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../utils/formatDate';

const badgeColors = [
  'bg-[#FF3385]',
  'bg-[#FFAF25]',
  'bg-[#2A67F7]',
  'bg-[#FF3D00]',
];

const BlogCard = ({ blog, index = 0 }) => {
  const imageUrl = blog?.image?.trim()
    ? blog.image
    : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80';

  return (
    <article className="group h-full overflow-hidden rounded-xl bg-white shadow-[0_0_4px_#cfcfcf] transition-shadow duration-300 hover:shadow-[0_0_20px_#cfcfcf]">
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${badgeColors[index % badgeColors.length]}`}>
            {blog.category || 'General'}
          </span>
        </div>
      </div>

      <div className="flex h-[calc(100%-13rem)] flex-col border-b-[3px] border-[#3858F6] p-5">
        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-[#111827] transition duration-150 group-hover:text-[#3858F6]">
          <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h2>

        <div className="mt-3 flex items-center gap-2.5 text-xs">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3858F6] text-[10px] font-bold text-white">
            {(blog.author?.name || 'A')[0].toUpperCase()}
          </div>
          <span className="font-semibold text-[#334155]">{blog.author?.name || 'Admin'}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-[#7B7F84]">
          <span>{formatDate(blog.createdAt)}</span>
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{blog.views || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
