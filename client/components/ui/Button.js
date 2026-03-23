
import Link from 'next/link';

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary:
    'bg-[#3858F6] text-white shadow-md hover:bg-black',
  secondary:
    'bg-[#F8F8F8] text-[#334155] hover:bg-[#3858F6] hover:text-white',
  ghost: 'text-[#334155] hover:bg-[#F8F8F8] shadow-none',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
};

export default function Button({
  href,
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const finalClassName = `${baseClass} ${variants[variant] || variants.primary} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={finalClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={finalClassName} {...props}>
      {children}
    </button>
  );
}

