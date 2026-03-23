'use client';

import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

const BlogEngagement = ({ blog }) => {
  const likedBy = (blog.likedBy || []).map((value) => value?.toString?.() || value);

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-amber-100 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Enjoyed this article?</h2>
          <LikeButton blogId={blog._id} initialLikes={blog.likes || 0} initialLikedBy={likedBy} />
        </div>
      </div>

      <CommentSection blogId={blog._id} />
    </section>
  );
};

export default BlogEngagement;
