import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { searchBooks } from '../services/googleBooks';
import { useBooksStore } from '../store';
import { BookCard } from '../components/BookCard';
import type { Book } from '../types';

// ✅ Define selectors outside component to prevent re-renders
const selectAddBook = (state: ReturnType<typeof useBooksStore.getState>) => state.addBook;
const selectBooks = (state: ReturnType<typeof useBooksStore.getState>) => state.books;

export function BrowsePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 300);
  const addBook = useBooksStore(selectAddBook);
  const books = useBooksStore(selectBooks);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const searchResults = await searchBooks(debouncedQuery);
        setResults(searchResults);

        if (searchResults.length === 0) {
          setError('No results found. Try a different search term.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(
          'Failed to search books. Please check your connection and try again.'
        );
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleAddBook = (book: Book) => {
    // Check if book already exists
    const existingBook = books.find((b) => b.id === book.id);

    if (existingBook) {
      // Show temporary feedback
      setAddedBooks((prev) => new Set(prev).add(book.id));
      setTimeout(() => {
        setAddedBooks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(book.id);
          return newSet;
        });
      }, 2000);
      return;
    }

    // Add book with "want-to-read" status
    addBook({
      ...book,
      status: 'want-to-read',
      addedAt: new Date().toISOString(),
    });

    // Show success feedback
    setAddedBooks((prev) => new Set(prev).add(book.id));

    // Remove feedback after 2 seconds
    setTimeout(() => {
      setAddedBooks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }, 2000);
  };

  const isBookInCollection = (bookId: string) => {
    return books.some((b) => b.id === bookId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Browse Books 🔍</h1>
        <p className="text-lg text-gray-600">
          Search millions of books and add them to your collection
        </p>
      </section>

      {/* Search Input */}
      <section className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            placeholder="Search by title, author, or ISBN..."
            aria-label="Search for books"
            autoFocus
          />
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"
              role="status"
              aria-label="Searching..."
            />
          </div>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          role="alert"
        >
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {results.length} results found
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((book) => {
              const inCollection = isBookInCollection(book.id);
              const justAdded = addedBooks.has(book.id);

              return (
                <div key={book.id} className="relative group">
                  <div onClick={() => navigate(`/book/${book.id}`)}>
                    <BookCard book={book} />
                  </div>

                  {/* Add Button */}
                  <div className="absolute bottom-2 left-2 right-2">
                    {inCollection ? (
                      <button
                        onClick={() => navigate('/my-books')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        aria-label={`${book.title} is in your collection. View in My Books`}
                      >
                        ✓ In Collection
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBook(book);
                        }}
                        className={`w-full text-sm font-medium py-2 px-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          justAdded
                            ? 'bg-green-600 text-white focus:ring-green-500'
                            : 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500'
                        }`}
                        aria-label={`Add ${book.title} to your collection`}
                      >
                        {justAdded ? '✓ Added!' : '+ Add to Collection'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && query.trim() === '' && (
        <div className="bg-gray-50 rounded-xl p-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Search for books
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a book title, author name, or ISBN to start discovering your
            next great read
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg animate-pulse h-80"
              aria-label="Loading results"
            />
          ))}
        </div>
      )}
    </div>
  );
}
