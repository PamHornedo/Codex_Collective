import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../store/feed';
import { useUserStore } from '../store/user';
import type { FeedPost } from '../types';

// ✅ Define selectors outside component to prevent re-renders
const selectUser = (state: ReturnType<typeof useUserStore.getState>) => state.user;
const selectPosts = (state: ReturnType<typeof useFeedStore.getState>) => state.posts;
const selectToggleLike = (state: ReturnType<typeof useFeedStore.getState>) => state.toggleLike;
const selectAddComment = (state: ReturnType<typeof useFeedStore.getState>) => state.addComment;

export function FeedPage() {
  const navigate = useNavigate();
  const user = useUserStore(selectUser);
  const posts = useFeedStore(selectPosts);
  const toggleLike = useFeedStore(selectToggleLike);
  const addComment = useFeedStore(selectAddComment);

  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    toggleLike(postId, user.id);
  };

  const handleAddComment = (e: FormEvent, postId: string) => {
    e.preventDefault();
    if (!user) return;

    const text = commentTexts[postId]?.trim();
    if (!text) return;

    addComment(postId, {
      userId: user.id,
      username: user.username,
      text,
    });

    // Clear input
    setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
  };

  const toggleCommentsExpanded = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const getActionText = (action: FeedPost['action']): string => {
    switch (action) {
      case 'added':
        return 'added';
      case 'started':
        return 'started reading';
      case 'finished':
        return 'finished reading';
    }
  };

  const getActionEmoji = (action: FeedPost['action']): string => {
    switch (action) {
      case 'added':
        return '📚';
      case 'started':
        return '📖';
      case 'finished':
        return '✅';
    }
  };

  const getUserAvatar = (username: string): string => {
    // Generate consistent avatar color based on username
    const colors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
    const index =
      username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Community Feed 🌟</h1>
        <p className="text-lg text-gray-600">
          See what your friends are reading and join the conversation
        </p>
      </section>

      {/* Feed Posts */}
      {sortedPosts.length > 0 ? (
        <section className="space-y-4">
          {sortedPosts.map((post) => {
            const isLiked = user ? post.likes.includes(user.id) : false;
            const isExpanded = expandedPosts.has(post.id);
            const hasComments = post.comments.length > 0;

            return (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${getUserAvatar(
                      post.username
                    )} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                    aria-label={`${post.username}'s avatar`}
                  >
                    {post.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          <span className="font-semibold">{post.username}</span>{' '}
                          {getActionEmoji(post.action)} {getActionText(post.action)}
                        </p>
                        <button
                          onClick={() => navigate(`/book/${post.bookId}`)}
                          className="text-teal-600 hover:text-teal-700 font-semibold hover:underline focus:outline-none focus:underline"
                        >
                          {post.bookTitle}
                        </button>
                      </div>
                      <time
                        className="text-sm text-gray-500 flex-shrink-0"
                        dateTime={post.timestamp}
                      >
                        {formatTimestamp(post.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1 ${
                      isLiked
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label={isLiked ? 'Unlike post' : 'Like post'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>
                      {post.likes.length}{' '}
                      {post.likes.length === 1 ? 'like' : 'likes'}
                    </span>
                  </button>

                  {/* Comment Toggle Button */}
                  <button
                    onClick={() => toggleCommentsExpanded(post.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1"
                    aria-label={isExpanded ? 'Hide comments' : 'Show comments'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>
                      {post.comments.length}{' '}
                      {post.comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                  </button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    {/* Existing Comments */}
                    {hasComments && (
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-3 pl-4 border-l-2 border-gray-200"
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 ${getUserAvatar(
                                comment.username
                              )} rounded-full flex items-center justify-center text-white font-bold text-xs`}
                              aria-label={`${comment.username}'s avatar`}
                            >
                              {comment.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-semibold text-gray-900">
                                  {comment.username}
                                </span>{' '}
                                <span className="text-gray-700">{comment.text}</span>
                              </p>
                              <time
                                className="text-xs text-gray-500"
                                dateTime={comment.timestamp}
                              >
                                {formatTimestamp(comment.timestamp)}
                              </time>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Form */}
                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 ${getUserAvatar(
                          user?.username || ''
                        )} rounded-full flex items-center justify-center text-white font-bold text-xs`}
                        aria-label="Your avatar"
                      >
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentTexts[post.id] || ''}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          aria-label="Comment text"
                        />
                        <button
                          type="submit"
                          disabled={!commentTexts[post.id]?.trim()}
                          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm"
                          aria-label="Post comment"
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </section>
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Your feed is empty
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add books to your collection to see updates in your feed!
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Browse Books
          </button>
        </div>
      )}
    </div>
  );
}
