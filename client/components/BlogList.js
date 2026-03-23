import BlogCard from './BlogCard';

const BlogList = ({ blogs }) => {
  if (!blogs?.length) {
    return (
      <div className="rounded-xl bg-[#F8F8F8] p-10 text-center text-[#7B7F84] shadow-[0_0_4px_#cfcfcf]">
        No blogs published yet. Create your first blog from admin panel.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog, index) => (
        <BlogCard key={blog._id} blog={blog} index={index} />
      ))}
    </div>
  );
};

export default BlogList;
