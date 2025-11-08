import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooksStore } from '../store/books';
import { getBookById } from '../services/googleBooks';
import type { Book, BookStatus } from '../types';

// ✅ Define selectors outside component to prevent re-renders
const selectBooks = (state: ReturnType<typeof useBooksStore.getState>) => state.books;
const selectAddBook = (state: ReturnType<typeof useBooksStore.getState>) => state.addBook;
const selectUpdateBookStatus = (state: ReturnType<typeof useBooksStore.getState>) => state.updateBookStatus;

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const books = useBooksStore(selectBooks);
  const addBook = useBooksStore(selectAddBook);
  const updateBookStatus = useBooksStore(selectUpdateBookStatus);

  const existingBook = books.find((b) => b.id === id);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('Book ID is missing');
        setIsLoading(false);
        return;
      }

      // Check if book is already in store
      if (existingBook) {
        setBook(existingBook);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      setIsLoading(true);
      setError('');

      try {
        const fetchedBook = await getBookById(id);
        setBook(fetchedBook);
      } catch (err) {
        console.error('Failed to fetch book:', err);
        setError('Failed to load book details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, existingBook]);

  const handleAddToCollection = (status: BookStatus) => {
    if (!book) return;

    if (existingBook) {
      // Update existing book status
      updateBookStatus(book.id, status);
    } else {
      // Add new book
      addBook({
        ...book,
        status,
        addedAt: new Date().toISOString(),
      });
    }

    // Navigate to My Books page after a short delay
    setTimeout(() => {
      navigate('/my-books');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center space-y-4">
          <svg
            className="w-12 h-12 text-red-600 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-red-900">
            {error || 'Book not found'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:underline group"
        aria-label="Go back to previous page"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>

      {/* Book Details Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            {book.thumbnail ? (
              <img
                src={book.thumbnail.replace('http://', 'https://')}
                alt={`Cover of ${book.title}`}
                className="w-full h-auto rounded-lg object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-teal-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Current Status Badge */}
          {existingBook && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm font-medium text-teal-900">
                ✓ In your collection
              </p>
              <p className="text-sm text-teal-700 mt-1">
                Status:{' '}
                <span className="font-semibold">
                  {existingBook.status === 'want-to-read' && 'Want to Read'}
                  {existingBook.status === 'currently-reading' &&
                    'Currently Reading'}
                  {existingBook.status === 'read' && 'Read'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Title and Authors */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {book.title}
            </h1>
            {book.authors && book.authors.length > 0 && (
              <p className="text-xl text-gray-600">by {book.authors.join(', ')}</p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {book.publishedDate && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{book.publishedDate}</span>
              </div>
            )}
            {book.pageCount && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{book.pageCount} pages</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {book.genres && book.genres.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {book.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h3>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {existingBook ? 'Update Status' : 'Add to Collection'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleAddToCollection('want-to-read')}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  existingBook?.status === 'want-to-read'
                    ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-label="Mark as want to read"
              >
                {existingBook?.status === 'want-to-read' ? '✓ ' : ''}
                Want to Read
              </button>
              <button
                onClick={() => handleAddToCollection('currently-reading')}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  existingBook?.status === 'currently-reading'
                    ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-label="Mark as currently reading"
              >
                {existingBook?.status === 'currently-reading' ? '✓ ' : ''}
                Currently Reading
              </button>
              <button
                onClick={() => handleAddToCollection('read')}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  existingBook?.status === 'read'
                    ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-label="Mark as read"
              >
                {existingBook?.status === 'read' ? '✓ ' : ''}
                Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
