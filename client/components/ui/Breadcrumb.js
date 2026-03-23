import Link from 'next/link';

/**
 * Breadcrumb Navigation Component
 * @param {Array} items - Array of {label, href} objects
 * Example: [{label: 'Home', href: '/'}, {label: 'Blog', href: '/blog'}, {label: 'Article Title'}]
 */
export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[#7B7F84]">/</span>
            )}
            
            {isLast ? (
              <span className="font-bold text-[#111827] truncate">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[#7B7F84] transition hover:text-[#3858F6] hover:underline"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
