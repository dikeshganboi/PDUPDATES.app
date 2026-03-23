'use client';

import DOMPurify from 'isomorphic-dompurify';

export default function SafeHtml({ html, className }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html || '') }}
    />
  );
}
