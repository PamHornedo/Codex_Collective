import { useUserStore } from '../store/user';
import type { User } from '../types';

/**
 * Custom hook that wraps the user store for convenient auth access
 * Provides a clean interface for authentication-related operations
 *
 * @returns Object containing user state and auth methods
 *
 * @example
 * ```typescript
 * function LoginPage() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   const handleLogin = () => {
 *     login('john_doe');
 *   };
 *
 *   if (isAuthenticated) {
 *     return <div>Welcome, {user?.username}!</div>;
 *   }
 *
 *   return <button onClick={handleLogin}>Login</button>;
 * }
 * ```
 */
export function useAuth() {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);

  return {
    /**
     * Current authenticated user or null if not logged in
     */
    user,

    /**
     * Boolean indicating if user is authenticated
     */
    isAuthenticated,

    /**
     * Login function - creates and persists user session
     * @param username - Username for the new session
     */
    login,

    /**
     * Logout function - clears user session and removes from storage
     */
    logout,
  };
}

/**
 * Type export for useAuth return value
 * Useful for typing component props that receive auth methods
 */
export type UseAuthReturn = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
};
