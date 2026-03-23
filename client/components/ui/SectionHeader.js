export default function SectionHeader({ eyebrow, title, subtitle, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow && (
        <span className="inline-flex rounded-md bg-[#3858F6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="mt-3 text-2xl font-extrabold leading-tight text-[#111827] md:text-[28px] tracking-tight">
            {title}
            <span className="ml-2 inline-block h-1 w-10 rounded-full bg-[#3858F6] align-middle" />
        </h2>
      )}
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-[#7B7F84] font-medium md:text-base">{subtitle}</p>}
    </div>
  );
}
