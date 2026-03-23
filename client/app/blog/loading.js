export default function BlogListingLoading() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 h-9 w-56 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl bg-white p-4 shadow-[0_0_4px_#cfcfcf]">
            <div className="mb-4 aspect-[16/9] rounded-xl bg-gray-200" />
            <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
            <div className="mb-2 h-6 w-11/12 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
