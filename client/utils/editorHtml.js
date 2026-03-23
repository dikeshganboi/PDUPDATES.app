import DOMPurify from 'isomorphic-dompurify';

export const stripHtml = (value) => value.replace(/<[^>]*>/g, '').trim();

export const cleanEditorHtml = (html) => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'del', 'ins',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'figure', 'figcaption',
      'sub', 'sup', 'mark',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height', 'loading',
      'class', 'style',
      'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
  });
};
