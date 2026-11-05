// Turns author-entered markdown-ish text (synopses, chapter openings) into plain
// text for cards, headers and meta descriptions, so stray "# Heading" lines or
// **bold** markers never show up as literal symbols.
export function toPlainText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // headings, quotes, list markers
    .replace(/[*_~`]+/g, "") // emphasis / code marks
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain text cut at a word boundary, with an ellipsis when shortened. */
export function excerpt(input: string | null | undefined, max = 160): string {
  const text = toPlainText(input);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : max)}…`;
}
