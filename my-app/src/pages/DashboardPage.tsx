import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useBooksStore } from '../store';
import { BookCard } from '../components/BookCard';
import { ReadingProgress } from '../components/ReadingProgress';
import { searchBooks } from '../services/googleBooks';
import type { Book } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const books = useBooksStore((state) => state.books);
  const readBooks = useMemo(
    () => books.filter((book) => book.status === 'read'),
    [books]
  );

  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [hasFetchedRecs, setHasFetchedRecs] = useState(false);

  // Get recently added books (last 5)
  const recentlyAdded = useMemo(
    () =>
      [...books]
        .filter((book) => book.addedAt) // Only books with addedAt timestamp
        .sort((a, b) => new Date(b.addedAt!).getTime() - new Date(a.addedAt!).getTime())
        .slice(0, 5),
    [books]
  );

  // Calculate reading challenge progress (goal: 12 books/year)
  const yearlyGoal = 12;
  const booksRead = readBooks.length;
  const progressPercentage = Math.min((booksRead / yearlyGoal) * 100, 100);

  // Fetch recommendations based on user's genres (only once on mount)
  useEffect(() => {
    if (hasFetchedRecs) return; // Prevent re-fetching

    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
      setHasFetchedRecs(true);

      try {
        if (books.length === 0) {
          // Default recommendations for new users
          const defaultResults = await searchBooks('bestsellers fiction');
          setRecommendations(defaultResults.slice(0, 6));
          return;
        }

        // Get unique genres from user's books
        const genres = new Set<string>();
        books.forEach((book) => {
          book.genres?.forEach((genre) => genres.add(genre));
        });

        if (genres.size === 0) {
          // No genres, fetch default
          const defaultResults = await searchBooks('bestsellers fiction');
          setRecommendations(defaultResults.slice(0, 6));
          return;
        }

        // Fetch recommendations based on random genre
        const genresArray = Array.from(genres);
        const randomGenre = genresArray[Math.floor(Math.random() * genresArray.length)];

        const results = await searchBooks(randomGenre);
        // Filter out books already in collection
        const filtered = results.filter(
          (rec) => !books.some((book) => book.id === rec.id)
        );
        setRecommendations(filtered.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations([]); // Set empty array on error
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Welcome Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {user?.username}! 📚
        </h1>
        <p className="text-lg text-gray-600">
          Continue your reading journey and discover new books
        </p>
      </section>

      {/* Reading Progress Section */}
      <section className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            2025 Reading Challenge
          </h2>
          <span className="text-sm font-medium text-teal-600">
            {booksRead} / {yearlyGoal} books
          </span>
        </div>
        <ReadingProgress current={booksRead} goal={yearlyGoal} />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {progressPercentage >= 100
              ? '🎉 Goal achieved! Keep reading!'
              : `${Math.round(progressPercentage)}% complete`}
          </span>
          {progressPercentage < 100 && (
            <span>{yearlyGoal - booksRead} books to go</span>
          )}
        </div>
      </section>

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
            <button
              onClick={() => navigate('/my-books')}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors focus:outline-none focus:underline"
              aria-label="View all books"
            >
              View all →
            </button>
          </div>

          {/* Horizontal scroll container */}
          <div className="relative">
            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentlyAdded.map((book) => (
                <div
                  key={book.id}
                  className="flex-none w-48 snap-start"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommendations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended for You
          </h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors focus:outline-none focus:underline"
            aria-label="Browse more books"
          >
            Browse more →
          </button>
        </div>

        {isLoadingRecs ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg animate-pulse h-64"
                aria-label="Loading recommendation"
              />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Add books to your collection to get personalized recommendations
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Browse Books
            </button>
          </div>
        )}
      </section>

      {/* Empty State for New Users */}
      {books.length === 0 && (
        <section className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-teal-600"
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
          <h3 className="text-2xl font-bold text-gray-900">
            Start Your Reading Journey
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Search for books, add them to your collection, and track your reading
            progress all in one place.
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Find Your First Book
          </button>
        </section>
      )}
    </div>
  );
}
