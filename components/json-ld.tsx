// Renders schema.org structured data. "<" is escaped so text from the database
// (titles, synopses) can never close the script tag.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data, (_key, value) => (value === undefined ? undefined : value)).replace(
    /</g,
    "\\u003c"
  );
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
