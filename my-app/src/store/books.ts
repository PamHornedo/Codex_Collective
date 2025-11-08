import { create } from 'zustand';
import type { Book } from '../types';
import { validateBooks } from '../schemas/storage';
import type { FeedAction } from '../types';

interface BooksState {
  books: Book[];
  searchResults: Book[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookStatus: (id: string, status: Book['status']) => void;
  setSearchResults: (results: Book[]) => void;
  clearSearch: () => void;
  loadBooks: () => void;
  saveBooks: () => void;

  // Computed getters
  getBooksByStatus: (status: Book['status']) => Book[];
  getWantToRead: () => Book[];
  getCurrentlyReading: () => Book[];
  getHaveRead: () => Book[];
}

const STORAGE_KEY = 'codex:v1:books';

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  searchResults: [],
  isLoading: false,
  error: null,

  addBook: (book: Book) => {
    const newBook: Book = {
      ...book,
      addedAt: new Date().toISOString(),
      status: book.status || 'want-to-read',
    };

    set((state) => {
      const updatedBooks = [...state.books, newBook];
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });

    // Auto-generate feed post when book is added
    // Lazy import to avoid circular dependency
    import('./user').then(({ useUserStore }) => {
      const user = useUserStore.getState().user;
      if (user) {
        import('./feed').then(({ useFeedStore }) => {
          useFeedStore.getState().addPost({
            userId: user.id,
            username: user.username,
            action: 'added',
            bookId: newBook.id,
            bookTitle: newBook.title,
          });
        });
      }
    });
  },

  removeBook: (id: string) => {
    set((state) => {
      const updatedBooks = state.books.filter((book) => book.id !== id);
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });
  },

  updateBookStatus: (id: string, status: Book['status']) => {
    const book = get().books.find((b) => b.id === id);
    const previousStatus = book?.status;

    set((state) => {
      const updatedBooks = state.books.map((book) =>
        book.id === id ? { ...book, status } : book
      );
      // Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
      return { books: updatedBooks };
    });

    // Auto-generate feed post when status changes to 'currently-reading' or 'read'
    // Lazy import to avoid circular dependency
    if (book && previousStatus !== status) {
      import('./user').then(({ useUserStore }) => {
        const user = useUserStore.getState().user;
        if (user) {
          let action: FeedAction | null = null;

          // Map status changes to feed actions
          if (status === 'currently-reading') {
            action = 'started';
          } else if (status === 'read') {
            action = 'finished';
          }

          // Only create feed post for meaningful status changes
          if (action) {
            import('./feed').then(({ useFeedStore }) => {
              useFeedStore.getState().addPost({
                userId: user.id,
                username: user.username,
                action,
                bookId: book.id,
                bookTitle: book.title,
              });
            });
          }
        }
      });
    }
  },

  setSearchResults: (results: Book[]) => {
    set({ searchResults: results, isLoading: false, error: null });
  },

  clearSearch: () => {
    set({ searchResults: [], error: null });
  },

  loadBooks: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = validateBooks(parsed);

        if (validated) {
          set({ books: validated });
        } else {
          // Invalid data, clear storage
          localStorage.removeItem(STORAGE_KEY);
          set({ books: [] });
        }
      }
    } catch (error) {
      console.error('Failed to load books from LocalStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
      set({ books: [] });
    }
  },

  saveBooks: () => {
    const { books } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  },

  // Computed getters
  getBooksByStatus: (status: Book['status']) => {
    return get().books.filter((book) => book.status === status);
  },

  getWantToRead: () => {
    return get().books.filter((book) => book.status === 'want-to-read');
  },

  getCurrentlyReading: () => {
    return get().books.filter((book) => book.status === 'currently-reading');
  },

  getHaveRead: () => {
    return get().books.filter((book) => book.status === 'read');
  },
}));

// Note: Store initialization should be done in App component's useEffect, not here
// This prevents issues with React's rendering cycle
