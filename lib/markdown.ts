// A minimal, safe markdown-ish renderer for chapter bodies.
// Supports: **bold**, *italic*, _italic_, blank-line paragraph breaks,
// single newlines as <br>. Escapes HTML first.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderChapterBody(raw: string): string {
  const escaped = escapeHtml(raw);
  const paragraphs = escaped.split(/\n{2,}/);
  return paragraphs
    .map((p) => {
      const withBreaks = p
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("\n");
}

export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
