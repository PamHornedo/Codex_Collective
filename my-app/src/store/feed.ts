import { create } from 'zustand';
import type { FeedPost, Comment } from '../types';
import { validateFeedPosts } from '../schemas/storage';

interface FeedState {
  posts: FeedPost[];

  // Actions
  addPost: (post: Omit<FeedPost, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  loadFeed: () => void;
  saveFeed: () => void;
}

const STORAGE_KEY = 'codex:v1:feed';

// Mock initial posts for friends Pamela and Joseph
const mockPosts: FeedPost[] = [
  {
    id: crypto.randomUUID(),
    userId: 'pamela-id',
    username: 'Pamela',
    action: 'finished',
    bookId: 'mock-book-1',
    bookTitle: 'The Great Gatsby',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: ['user-1', 'user-2', 'user-3', 'joseph-id', 'user-4'],
    comments: [
      {
        id: crypto.randomUUID(),
        userId: 'joseph-id',
        username: 'Joseph',
        text: 'Great book! What did you think of the ending?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    userId: 'joseph-id',
    username: 'Joseph',
    action: 'started',
    bookId: 'mock-book-2',
    bookTitle: 'To Kill a Mockingbird',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes: ['user-1', 'pamela-id', 'user-2'],
    comments: [],
  },
  {
    id: crypto.randomUUID(),
    userId: 'pamela-id',
    username: 'Pamela',
    action: 'started',
    bookId: 'mock-book-3',
    bookTitle: '1984',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likes: ['user-1', 'joseph-id', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7'],
    comments: [
      {
        id: crypto.randomUUID(),
        userId: 'joseph-id',
        username: 'Joseph',
        text: 'This one is intense! Let me know what you think.',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        userId: 'pamela-id',
        username: 'Pamela',
        text: 'Already hooked! The world-building is incredible.',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],

  addPost: (postData) => {
    const newPost: FeedPost = {
      ...postData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
    };

    set((state) => {
      const updatedPosts = [newPost, ...state.posts]; // New posts at the top
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      return { posts: updatedPosts };
    });
  },

  toggleLike: (postId: string, userId: string) => {
    set((state) => {
      const updatedPosts = state.posts.map((post) => {
        if (post.id === postId) {
          const hasLiked = post.likes.includes(userId);
          const newLikes = hasLiked
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId];
          return { ...post, likes: newLikes };
        }
        return post;
      });
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      return { posts: updatedPosts };
    });
  },

  addComment: (postId: string, commentData) => {
    const newComment: Comment = {
      ...commentData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const updatedPosts = state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      return { posts: updatedPosts };
    });
  },

  loadFeed: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = validateFeedPosts(parsed);

        if (validated) {
          set({ posts: validated });
        } else {
          // Invalid data, use mock posts
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPosts));
          set({ posts: mockPosts });
        }
      } else {
        // No stored data, use mock posts
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPosts));
        set({ posts: mockPosts });
      }
    } catch (error) {
      console.error('Failed to load feed from LocalStorage:', error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPosts));
      set({ posts: mockPosts });
    }
  },

  saveFeed: () => {
    const { posts } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },
}));

// Note: Store initialization should be done in App component's useEffect, not here
// This prevents issues with React's rendering cycle
