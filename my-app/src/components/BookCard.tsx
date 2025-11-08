import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  isDraggable?: boolean;
}

export function BookCard({
  book,
  onClick,
  onAdd,
  onRemove,
  isDraggable = false,
}: BookCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 group ${
        onClick || isDraggable ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''
      } ${isDraggable ? 'active:cursor-grabbing active:rotate-3' : ''}`}
      role="article"
      aria-label={`${book.title} by ${book.authors?.join(', ') || 'Unknown author'}`}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-teal-100 to-blue-100">
        {book.thumbnail ? (
          <img
            src={book.thumbnail.replace('http://', 'https://')}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-teal-300"
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

        {/* Status Badge */}
        {book.status && (
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                book.status === 'read'
                  ? 'bg-green-100 text-green-800'
                  : book.status === 'currently-reading'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {book.status === 'read' && '✓'}
              {book.status === 'currently-reading' && '📖'}
              {book.status === 'want-to-read' && '📚'}
            </span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
          {book.title}
        </h3>
        {book.authors && book.authors.length > 0 && (
          <p className="text-xs text-gray-600 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
      </div>

      {/* Action Buttons (if provided) */}
      {(onAdd || onRemove) && (
        <div className="px-3 pb-3">
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label={`Add ${book.title} to collection`}
            >
              + Add
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Remove ${book.title} from collection`}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
