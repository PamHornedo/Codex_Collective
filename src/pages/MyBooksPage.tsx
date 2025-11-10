import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useBooksStore } from '../store/books';
import { BookCard } from '../components/BookCard';
import type { Book, BookStatus } from '../types';

type TabType = 'want-to-read' | 'currently-reading' | 'read';

export function MyBooksPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('want-to-read');
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  // ✅ NEW APPROACH: Get books array ONCE from Zustand, filter with useMemo
  // This prevents infinite loops by letting React control memoization
  const books = useBooksStore((state) => state.books);
  const updateBookStatus = useBooksStore((state) => state.updateBookStatus);

  // Filter books using useMemo - only recalculates when books array changes
  const wantToReadBooks = useMemo(
    () => books.filter((book) => book.status === 'want-to-read'),
    [books]
  );
  
  const currentlyReadingBooks = useMemo(
    () => books.filter((book) => book.status === 'currently-reading'),
    [books]
  );
  
  const readBooks = useMemo(
    () => books.filter((book) => book.status === 'read'),
    [books]
  );

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: 'want-to-read', label: 'Want to Read', count: wantToReadBooks.length },
    {
      id: 'currently-reading',
      label: 'Currently Reading',
      count: currentlyReadingBooks.length,
    },
    { id: 'read', label: 'Read', count: readBooks.length },
  ];

  const getCurrentBooks = (): Book[] => {
    switch (activeTab) {
      case 'want-to-read':
        return wantToReadBooks;
      case 'currently-reading':
        return currentlyReadingBooks;
      case 'read':
        return readBooks;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const book = getCurrentBooks().find((b) => b.id === active.id);
    setActiveBook(book || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveBook(null);
      return;
    }

    // Extract book ID and target status
    const bookId = active.id as string;
    const targetStatus = over.id as BookStatus;

    // Update book status if it's a valid drop zone
    if (['want-to-read', 'currently-reading', 'read'].includes(targetStatus)) {
      updateBookStatus(bookId, targetStatus);
    }

    setActiveBook(null);
  };

  const handleDragCancel = () => {
    setActiveBook(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">My Books 📚</h1>
          <p className="text-lg text-gray-600">
            Organize your reading collection with drag and drop
          </p>
        </section>

        {/* Tabs */}
        <section>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Book status tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-t
                    ${
                      activeTab === tab.id
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </section>

        {/* Drop Zone */}
        <section className="min-h-[400px]">
          <SortableContext
            items={getCurrentBooks().map((b) => b.id)}
            strategy={rectSortingStrategy}
          >
            {/* Books Grid */}
            {getCurrentBooks().length > 0 ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                role="region"
                aria-label={`${tabs.find((t) => t.id === activeTab)?.label} books`}
              >
                {getCurrentBooks().map((book) => (
                  <div
                    key={book.id}
                    className="cursor-move touch-none"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <BookCard book={book} isDraggable />
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No books in "{tabs.find((t) => t.id === activeTab)?.label}"
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {activeTab === 'want-to-read' &&
                    'Browse our collection and add books you want to read'}
                  {activeTab === 'currently-reading' &&
                    'Drag books here when you start reading them'}
                  {activeTab === 'read' &&
                    'Drag books here when you finish reading them'}
                </p>
                {activeTab === 'want-to-read' && (
                  <button
                    onClick={() => navigate('/browse')}
                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Browse Books
                  </button>
                )}
              </div>
            )}
          </SortableContext>
        </section>

        {/* Drag Instructions */}
        {getCurrentBooks().length > 0 && (
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  💡 Pro tip: Drag books between tabs to update their status
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Keyboard users: Press Space to pick up a book, use Arrow keys to
                  move, and press Space again to drop
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeBook ? (
          <div className="rotate-6 opacity-80 cursor-grabbing">
            <BookCard book={activeBook} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
