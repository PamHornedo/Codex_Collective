import { create } from 'zustand';
import type { User } from '../types';
import { validateUser } from '../schemas/storage';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => void;
  logout: () => void;
  loadUser: () => void;
}

const STORAGE_KEY = 'codex:v1:user';

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (username: string) => {
    const user: User = {
      id: crypto.randomUUID(),
      username: username.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = validateUser(parsed);

        if (validated) {
          set({ user: validated, isAuthenticated: true, isLoading: false });
        } else {
          // Invalid data, clear storage
          localStorage.removeItem(STORAGE_KEY);
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user from LocalStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
      set({ isLoading: false });
    }
  },
}));

// Note: Store initialization should be done in App component's useEffect, not here
// This prevents issues with React's rendering cycle
