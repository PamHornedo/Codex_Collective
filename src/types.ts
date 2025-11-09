/**
 * Central TypeScript type definitions for Codex Collective
 * These types are inferred from Zod schemas in schemas/storage.ts
 */

// Book status type
export type BookStatus = 'want-to-read' | 'currently-reading' | 'read';

// User type
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// Book type
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  genres?: string[];
  status?: BookStatus;
  addedAt?: string;
}

// Comment type
export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

// Feed action type
export type FeedAction = 'added' | 'started' | 'finished';

// Feed post type
export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  action: FeedAction;
  bookId: string;
  bookTitle: string;
  timestamp: string;
  likes: string[]; // Array of user IDs who liked this post
  comments: Comment[];
}
