import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Custom hook to persist state to localStorage
 * Automatically syncs state with localStorage on changes
 *
 * @param key - LocalStorage key to store the value
 * @param initialValue - Initial value if key doesn't exist in localStorage
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```typescript
 * const [user, setUser] = useLocalStorage<User>('codex:v1:user', null);
 *
 * // Set value (automatically persists to localStorage)
 * setUser({ id: '1', username: 'john' });
 *
 * // Clear value
 * setUser(null);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or return initialValue if doesn't exist
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error parsing JSON, log and return initial value
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        if (valueToStore === null || valueToStore === undefined) {
          // Remove from localStorage if value is null/undefined
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      // Handle errors (e.g., localStorage quota exceeded)
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
