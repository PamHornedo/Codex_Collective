/**
 * Example test file for Google Books API Service
 *
 * NOTE: These tests require a valid API key in .env.local
 * Run with: npm run test (after setting up testing framework)
 */

import {
  searchBooks,
  getBookDetails,
  getRecommendations,
  isAPIKeyConfigured,
  GoogleBooksAPIError,
  mapGoogleBookToBook,
} from './googleBooks';

/**
 * Manual test function - call this from browser console or a test page
 * to verify API integration works correctly
 */
export async function testGoogleBooksAPI() {
  console.log('🧪 Testing Google Books API Integration...\n');

  // Test 1: Check API key configuration
  console.log('Test 1: API Key Configuration');
  const isConfigured = isAPIKeyConfigured();
  console.log(`✅ API Key configured: ${isConfigured}`);
  if (!isConfigured) {
    console.error('❌ API key is not configured. Add it to .env.local');
    return;
  }
  console.log('');

  // Test 2: Search for books
  console.log('Test 2: Search Books');
  try {
    const searchResults = await searchBooks('react programming', 5);
    console.log(`✅ Found ${searchResults.length} books`);
    console.log('First result:', searchResults[0]?.title);
    console.log('');
  } catch (error) {
    console.error('❌ Search failed:', error);
    console.log('');
  }

  // Test 3: Empty search query
  console.log('Test 3: Empty Search Query');
  try {
    const emptyResults = await searchBooks('');
    console.log(`✅ Empty query returned ${emptyResults.length} results (expected: 0)`);
    console.log('');
  } catch (error) {
    console.error('❌ Empty search failed:', error);
    console.log('');
  }

  // Test 4: Get book details (using a known book ID)
  console.log('Test 4: Get Book Details');
  try {
    // Example book ID - replace with actual ID from search results
    const bookId = 'nggnmAEACAAJ'; // "Clean Code" by Robert C. Martin
    const bookDetails = await getBookDetails(bookId);
    console.log(`✅ Retrieved book: ${bookDetails.title}`);
    console.log(`   Authors: ${bookDetails.authors.join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ Get book details failed:', error);
    console.log('');
  }

  // Test 5: Get recommendations
  console.log('Test 5: Get Recommendations');
  try {
    const recommendations = await getRecommendations(['fiction', 'mystery'], 5);
    console.log(`✅ Found ${recommendations.length} recommendations`);
    console.log('First recommendation:', recommendations[0]?.title);
    console.log('');
  } catch (error) {
    console.error('❌ Get recommendations failed:', error);
    console.log('');
  }

  // Test 6: Error handling - invalid book ID
  console.log('Test 6: Error Handling (Invalid Book ID)');
  try {
    await getBookDetails('invalid_id_12345');
    console.log('❌ Should have thrown an error for invalid ID');
  } catch (error) {
    if (error instanceof GoogleBooksAPIError) {
      console.log('✅ Correctly threw GoogleBooksAPIError');
    } else {
      console.log('⚠️ Threw error but not GoogleBooksAPIError type');
    }
    console.log('');
  }

  // Test 7: Mapping function
  console.log('Test 7: Data Mapping');
  const mockAPIResponse = {
    id: 'test123',
    volumeInfo: {
      title: 'Test Book',
      authors: ['John Doe'],
      description: 'A test book',
      imageLinks: {
        thumbnail: 'https://example.com/image.jpg',
      },
      publishedDate: '2024-01-01',
      pageCount: 300,
      categories: ['Fiction'],
    },
  };

  const mappedBook = mapGoogleBookToBook(mockAPIResponse);
  console.log('✅ Mapped book:', mappedBook.title);
  console.log(`   Has all required fields: ${
    mappedBook.id && mappedBook.title && mappedBook.authors.length > 0
  }`);
  console.log('');

  // Test 8: Mapping with missing data
  console.log('Test 8: Data Mapping (Missing Fields)');
  const incompleteMockResponse = {
    id: 'test456',
    volumeInfo: {
      title: 'Incomplete Book',
      // Missing authors, description, imageLinks
    },
  };

  const mappedIncompleteBook = mapGoogleBookToBook(incompleteMockResponse);
  console.log('✅ Mapped book with defaults:', mappedIncompleteBook.title);
  console.log(`   Default authors: ${mappedIncompleteBook.authors[0]}`);
  console.log(`   Default description: ${mappedIncompleteBook.description.substring(0, 30)}...`);
  console.log(`   Placeholder thumbnail: ${mappedIncompleteBook.thumbnail.includes('placeholder')}`);
  console.log('');

  console.log('🎉 All tests completed!');
}

/**
 * Quick inline test - can be called from components during development
 */
export async function quickAPITest() {
  try {
    console.log('🔍 Quick API Test: Searching for "javascript"...');
    const results = await searchBooks('javascript', 3);
    console.log(`✅ Success! Found ${results.length} books.`);
    results.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.authors.join(', ')}`);
    });
    return results;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    throw error;
  }
}

/**
 * Usage in a React component:
 *
 * import { quickAPITest } from '../services/googleBooks.test.example';
 *
 * // In useEffect or button click handler:
 * quickAPITest();
 */
