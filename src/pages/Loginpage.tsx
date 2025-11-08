import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user';

// ✅ Define selector outside component to prevent re-renders
const selectLogin = (state: ReturnType<typeof useUserStore.getState>) => state.login;

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useUserStore(selectLogin);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (trimmedUsername.length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }

    // Clear error and login
    setError('');
    login(trimmedUsername);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-2">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Codex Collective
            </h1>
            <p className="text-gray-600">
              Enter your username to start tracking your reading journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(''); // Clear error on input change
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  error
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                } focus:ring-2 focus:ring-offset-0 transition-colors duration-200`}
                placeholder="Enter your username"
                autoFocus
                autoComplete="username"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'username-error' : undefined}
              />
              {error && (
                <p
                  id="username-error"
                  className="mt-2 text-sm text-red-600 animate-shake"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 active:scale-98 transform"
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            No password required • Local storage only
          </p>
        </div>
      </div>
    </div>
  );
}
