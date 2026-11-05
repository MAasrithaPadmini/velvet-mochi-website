// Chapter numbers in the database are slots (the Prologue is #1), while many
// chapter titles carry their own number ("Chapter 140: The Aftermath"). Showing
// both reads as "Chapter 141 · Chapter 140", so only add the slot number when
// the title doesn't already say what it is.

const SELF_NAMED = /^\s*(chapter|ch\.?|prologue|epilogue|interlude|part|bonus|extra|special)\b/i;

export function titleHasOwnNumber(title: string): boolean {
  return SELF_NAMED.test(title);
}

/** "Chapter 140: The Aftermath" stays as is; "The Aftermath" becomes "Chapter 141: The Aftermath". */
export function chapterLabel(chapter: { number: number; title: string }): string {
  const title = chapter.title.trim();
  return titleHasOwnNumber(title) ? title : `Chapter ${chapter.number}: ${title}`;
}

/** Reader-facing name for a story's status. Only published stories are public. */
export function storyStatusLabel(status: string): string {
  return status === "archived" ? "Completed" : "Ongoing";
}
