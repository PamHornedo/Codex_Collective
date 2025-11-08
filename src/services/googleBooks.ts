import type { Book } from '../types';

/**
 * Google Books API Service
 * Handles all interactions with the Google Books API
 * API key is stored securely in environment variables
 */

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Custom error class for API-related errors
 */
export class GoogleBooksAPIError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'GoogleBooksAPIError';
    this.statusCode = statusCode;
  }
}

/**
 * Delay utility for retry logic
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic fetch wrapper with retry logic and error handling
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleBooksAPIError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && error instanceof GoogleBooksAPIError) {
      console.warn(`API request failed, retrying... (${retries} retries left)`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

/**
 * Maps Google Books API response item to internal Book interface
 * Handles missing or null fields gracefully
 */
export function mapGoogleBookToBook(item: any): Book {
  const volumeInfo = item.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};

  return {
    id: item.id || '',
    title: volumeInfo.title || 'Untitled',
    authors: volumeInfo.authors || ['Unknown Author'],
    description: volumeInfo.description || 'No description available.',
    thumbnail: imageLinks.thumbnail ||
               imageLinks.smallThumbnail ||
               'https://via.placeholder.com/128x192?text=No+Cover',
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    genres: volumeInfo.categories, // Map categories to genres
  };
}

/**
 * Searches for books using the Google Books API
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Array of Book objects
 */
export async function searchBooks(
  query: string,
  maxResults: number = 20
): Promise<Book[]> {
  if (!query.trim()) {
    return [];
  }

  if (!API_KEY) {
    console.error('Google Books API key is not configured. Please add VITE_GOOGLE_BOOKS_API_KEY to your .env.local file');
    throw new GoogleBooksAPIError('API key not configured');
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${BASE_URL}?q=${encodedQuery}&maxResults=${maxResults}&key=${API_KEY}`;

    const data = await fetchWithRetry(url);

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map(mapGoogleBookToBook);
  } catch (error) {
    console.error('Error searching books:', error);

    if (error instanceof GoogleBooksAPIError) {
      throw error;
    }

    throw new GoogleBooksAPIError('Failed to search books. Please try again.');
  }
}

/**
 * Fetches detailed information for a specific book by ID
 * @param id - Google Books volume ID
 * @returns Book object with full details
 */
export async function getBookDetails(id: string): Promise<Book> {
  if (!id) {
    throw new GoogleBooksAPIError('Book ID is required');
  }

  if (!API_KEY) {
    console.error('Google Books API key is not configured. Please add VITE_GOOGLE_BOOKS_API_KEY to your .env.local file');
    throw new GoogleBooksAPIError('API key not configured');
  }

  try {
    const url = `${BASE_URL}/${id}?key=${API_KEY}`;

    const data = await fetchWithRetry(url);

    return mapGoogleBookToBook(data);
  } catch (error) {
    console.error(`Error fetching book details for ID ${id}:`, error);

    if (error instanceof GoogleBooksAPIError) {
      throw error;
    }

    throw new GoogleBooksAPIError('Failed to fetch book details. Please try again.');
  }
}

/**
 * Fetches book recommendations based on genres/categories
 * @param genres - Array of genre strings to search for
 * @param maxResults - Maximum number of recommendations (default: 10)
 * @returns Array of recommended Book objects
 */
export async function getRecommendations(
  genres: string[],
  maxResults: number = 10
): Promise<Book[]> {
  if (!genres || genres.length === 0) {
    // Default fallback genres if none provided
    genres = ['fiction', 'bestseller'];
  }

  if (!API_KEY) {
    console.error('Google Books API key is not configured. Please add VITE_GOOGLE_BOOKS_API_KEY to your .env.local file');
    throw new GoogleBooksAPIError('API key not configured');
  }

  try {
    // Build query from genres (e.g., "subject:fiction" or "subject:science fiction")
    const genreQuery = genres
      .map(genre => `subject:${encodeURIComponent(genre)}`)
      .join(' OR ');

    const url = `${BASE_URL}?q=${genreQuery}&orderBy=relevance&maxResults=${maxResults}&key=${API_KEY}`;

    const data = await fetchWithRetry(url);

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map(mapGoogleBookToBook);
  } catch (error) {
    console.error('Error fetching recommendations:', error);

    if (error instanceof GoogleBooksAPIError) {
      throw error;
    }

    throw new GoogleBooksAPIError('Failed to fetch recommendations. Please try again.');
  }
}

/**
 * Alias for getBookDetails - fetches a book by its Google Books ID
 * @param id - Google Books volume ID
 * @returns Book object
 */
export async function getBookById(id: string): Promise<Book> {
  return getBookDetails(id);
}

/**
 * Validates that the API key is configured
 * Useful for checking configuration on app startup
 */
export function isAPIKeyConfigured(): boolean {
  return !!API_KEY;
}
