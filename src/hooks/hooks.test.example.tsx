/**
 * Example test file for custom hooks
 * These tests demonstrate how to test each hook
 *
 * NOTE: Requires testing framework setup (Jest + React Testing Library)
 * Run with: npm run test (after setting up testing)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';

/**
 * Test Suite: useDebounce Hook
 */
describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });

    // Should still be old value immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    // Rapid changes
    rerender({ value: 'second' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'third' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'fourth' });
    act(() => jest.advanceTimersByTime(100));

    // Still should be initial value (only 300ms total passed)
    expect(result.current).toBe('first');

    // Advance another 200ms (total 500ms from last change)
    act(() => jest.advanceTimersByTime(200));

    // Now should be the last value
    expect(result.current).toBe('fourth');
  });

  it('should work with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 123 } }
    );

    expect(result.current).toBe(123);

    rerender({ value: 456 });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe(456);
  });

  it('should handle objects and arrays', () => {
    const obj = { name: 'test', value: 42 };
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: obj } }
    );

    expect(result.current).toEqual(obj);

    const newObj = { name: 'updated', value: 100 };
    rerender({ value: newObj });

    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toEqual(newObj);
  });
});

/**
 * Test Suite: useLocalStorage Hook
 */
describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('should load existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing-value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    expect(result.current[0]).toBe('existing-value');
  });

  it('should handle objects and arrays', () => {
    const testObject = { name: 'John', age: 30 };

    const { result } = renderHook(() =>
      useLocalStorage<typeof testObject>('test-object', testObject)
    );

    const updatedObject = { name: 'Jane', age: 25 };

    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('test-object')!)).toEqual(
      updatedObject
    );
  });

  it('should remove item when set to null', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('value');
    });

    expect(localStorage.getItem('test-key')).toBeTruthy();

    act(() => {
      result.current[1](null as any);
    });

    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('should handle JSON parsing errors gracefully', () => {
    // Set invalid JSON
    localStorage.setItem('test-key', 'invalid-json{');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback')
    );

    // Should return initial value on parse error
    expect(result.current[0]).toBe('fallback');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should work with function updater', () => {
    const { result } = renderHook(() =>
      useLocalStorage('counter', 0)
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });
});

/**
 * Test Suite: useAuth Hook
 */
describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should login user and update state', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('testuser');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.username).toBe('testuser');
  });

  it('should persist user to localStorage on login', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('testuser');
    });

    const stored = localStorage.getItem('codex:v1:user');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.username).toBe('testuser');
    expect(parsed.id).toBeTruthy();
    expect(parsed.createdAt).toBeTruthy();
  });

  it('should logout user and clear state', () => {
    const { result } = renderHook(() => useAuth());

    // Login first
    act(() => {
      result.current.login('testuser');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('codex:v1:user')).toBeNull();
  });

  it('should load existing user from localStorage on mount', () => {
    // Pre-populate localStorage
    const existingUser = {
      id: 'test-id',
      username: 'existing-user',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('codex:v1:user', JSON.stringify(existingUser));

    const { result } = renderHook(() => useAuth());

    // Should auto-load the user
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('existing-user');
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useAuth());

    const loginRef1 = result.current.login;
    const logoutRef1 = result.current.logout;

    rerender();

    const loginRef2 = result.current.login;
    const logoutRef2 = result.current.logout;

    // Functions should be stable across re-renders
    expect(loginRef1).toBe(loginRef2);
    expect(logoutRef1).toBe(logoutRef2);
  });
});

/**
 * Integration Test: Hooks working together
 */
describe('Hook Integration', () => {
  it('should work together in a realistic scenario', async () => {
    // Simulate a search component using multiple hooks
    const { result: authResult } = renderHook(() => useAuth());
    const { result: searchResult } = renderHook(() => {
      const [query, setQuery] = useLocalStorage('search-query', '');
      const debouncedQuery = useDebounce(query, 300);
      return { query, setQuery, debouncedQuery };
    });

    // Login first
    act(() => {
      authResult.current.login('testuser');
    });

    expect(authResult.current.isAuthenticated).toBe(true);

    // Set search query
    act(() => {
      searchResult.current.setQuery('react books');
    });

    // Query should be set immediately
    expect(searchResult.current.query).toBe('react books');

    // Debounced query should still be empty
    expect(searchResult.current.debouncedQuery).toBe('');

    // Wait for debounce
    await waitFor(
      () => {
        expect(searchResult.current.debouncedQuery).toBe('react books');
      },
      { timeout: 400 }
    );

    // Query should be persisted to localStorage
    expect(localStorage.getItem('search-query')).toBe(
      JSON.stringify('react books')
    );
  });
});
