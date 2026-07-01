import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "a", "b", "blockquote", "br", "caption", "cite", "code",
  "col", "colgroup", "dd", "del", "details", "div", "dl", "dt",
  "em", "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "img", "ins", "li", "mark", "ol", "p", "pre",
  "s", "small", "span", "strong", "sub", "summary", "sup",
  "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
  col: ["span"],
  colgroup: ["span"],
  "*": ["class"],
};

export function sanitize(html: string): string {
  if (!html) return "";
  // Replace non-breaking spaces (both the &nbsp; entity and the raw
  // character) with regular spaces. Pasted rich text often carries these, and
  // they glue words into one unbreakable token — which then either overflows
  // its container or gets broken mid-word by overflow-wrap. Regular spaces wrap
  // normally at word boundaries.
  const normalized = html.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ");
  return sanitizeHtml(normalized, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });
}
