import Link from 'next/link';

/**
 * Breadcrumb Navigation Component
 * @param {Array} items - Array of {label, href} objects
 * Example: [{label: 'Home', href: '/'}, {label: 'Blog', href: '/blog'}, {label: 'Article Title'}]
 */
export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 min-w-0 overflow-hidden">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7B7F84] sm:text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="shrink-0 text-[#7B7F84]">/</span>
            )}
            
            {isLast ? (
              <span className="block min-w-0 max-w-full truncate font-semibold text-[#111827]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="shrink-0 whitespace-nowrap transition hover:text-[#3858F6] hover:underline"
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
      </ol>
    </nav>
  );
}
