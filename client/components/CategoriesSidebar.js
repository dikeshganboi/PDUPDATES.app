'use client';

import Button from './ui/Button';

const CategoriesSidebar = ({ categories = [] }) => {
  const resolved = categories.length
    ? categories
    : [
        { name: 'Tech', count: 0 },
        { name: 'Jobs', count: 0 },
        { name: 'Guides', count: 0 },
      ];

  return (
    <aside className="space-y-6">
      <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <h3 className="text-lg font-extrabold text-[#111827]">Categories</h3>
        <div className="mt-4 space-y-1">
          {resolved.map((category) => (
            <a
              key={category.name}
              href={`/blog?category=${encodeURIComponent(category.name)}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#F8F8F8] hover:text-[#3858F6]"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3858F6]" />
                {category.name}
              </span>
              <span className="rounded-full bg-[#F8F8F8] px-2 py-0.5 text-xs font-bold text-[#7B7F84]">{category.count}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <h3 className="text-lg font-extrabold text-[#111827]">Stay Updated</h3>
        <p className="mb-4 mt-3 text-sm text-[#7B7F84]">Get practical posts and product insights every week.</p>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email"
            className="input-premium"
            suppressHydrationWarning
          />
          <Button type="submit" className="w-full" suppressHydrationWarning>
            Subscribe
          </Button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-[0_0_4px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <h3 className="mb-3 text-lg font-extrabold text-[#111827]">About PD Updates</h3>
        <p className="text-sm leading-relaxed text-[#7B7F84]">
          Your go-to platform for the latest jobs, deals, career updates, and practical guides for modern professionals.
        </p>
      </div>
    </aside>
  );
};

export default CategoriesSidebar;
