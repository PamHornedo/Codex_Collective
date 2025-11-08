import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(1),
  createdAt: z.string(),
});

// Book schema
export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  description: z.string(),
  thumbnail: z.string(),
  publishedDate: z.string().optional(),
  pageCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  status: z.enum(['want-to-read', 'currently-reading', 'read']).optional(),
  addedAt: z.string().optional(),
});

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  text: z.string(),
  timestamp: z.string(),
});

// Feed post schema
export const feedPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  action: z.enum(['added', 'started', 'finished']),
  bookId: z.string(),
  bookTitle: z.string(),
  timestamp: z.string(),
  likes: z.array(z.string()), // Array of user IDs who liked this post
  comments: z.array(commentSchema),
});

// Validation functions
export const validateUser = (data: unknown) => {
  try {
    return userSchema.parse(data);
  } catch (error) {
    console.error('User validation failed:', error);
    return null;
  }
};

export const validateBook = (data: unknown) => {
  try {
    return bookSchema.parse(data);
  } catch (error) {
    console.error('Book validation failed:', error);
    return null;
  }
};

export const validateBooks = (data: unknown) => {
  try {
    return z.array(bookSchema).parse(data);
  } catch (error) {
    console.error('Books array validation failed:', error);
    return null;
  }
};

export const validateFeedPost = (data: unknown) => {
  try {
    return feedPostSchema.parse(data);
  } catch (error) {
    console.error('Feed post validation failed:', error);
    return null;
  }
};

export const validateFeedPosts = (data: unknown) => {
  try {
    return z.array(feedPostSchema).parse(data);
  } catch (error) {
    console.error('Feed posts array validation failed:', error);
    return null;
  }
};
