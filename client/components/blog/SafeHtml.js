'use client';

export default function SafeHtml({ html, className }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html || '' }}
      suppressHydrationWarning
    />
  );
}
