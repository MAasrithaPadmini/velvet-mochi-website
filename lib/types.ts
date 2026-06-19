export type Role = "reader" | "author" | "admin";

export type Story = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  status: "draft" | "published" | "archived";
  universe: string;
  genre: string;
  heat: string;
  cover_url: string | null;
  cover: string;
  rating: number;
  readers: string;
  trigger_warnings: string[];
  next_release: string;
  chapter_count: number;
  progress: number;
  characters: string[];
  mature: boolean;
};

export type Chapter = {
  id: string;
  story_id: string;
  story_slug?: string;
  story_title?: string;
  number: number;
  title: string;
  body: string;
  status: "draft" | "scheduled" | "published";
  reading_minutes: number;
  views: number;
  scheduled_for: string | null;
  published_at: string | null;
};

export type Profile = {
  id: string;
  display_name: string;
  role: Role;
  avatar_url: string | null;
  favorite_genres: string[];
  age_confirmed: boolean;
};

export type Bookmark = {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string | null;
  label: string;
  created_at: string;
};

export type ReadingProgress = {
  user_id: string;
  story_id: string;
  chapter_id: string;
  progress: number;
  updated_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string | null;
  body: string;
  created_at: string;
  display_name?: string;
};

export type Notification = {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  created_at: string;
};
