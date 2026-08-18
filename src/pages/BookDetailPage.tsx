import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url?: string;
  genre?: string;
  publication_year?: number;
  isbn?: string;
  is_borrowed?: boolean;
  avg_rating: number;
  review_count: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
  avatar_url?: string;
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState('');

  const fetchBook = async () => {
    try {
      const res = await API.get(`/books/${id}`);
      setBook(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load book');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/books/${id}/reviews`);
      setReviews(res.data);
    } catch (err: any) {
      console.error('Failed to fetch reviews', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchBook(), fetchReviews()]).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to review');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`/books/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment || null,
      });
      setReviewRating(5);
      setReviewComment('');
      await fetchReviews(); // refresh
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleUpdateReview = async (reviewId: number) => {
    try {
      await API.patch(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment || null,
      });
      setEditingReviewId(null);
      await fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      await fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number, size: number = 4) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
        ))}
        {halfStar === 1 && <Star className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`w-${size} h-${size} text-slate-500`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
        <div className="text-white text-center">
          <p className="text-xl">{error || 'Book not found'}</p>
          <Link to="/books" className="text-indigo-300 hover:text-indigo-100 mt-4 inline-block">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/books" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Books
        </Link>

        {/* Book Info Card */}
        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="w-48 h-auto rounded-lg shadow-lg" />
              ) : (
                <div className="w-48 h-64 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">No cover</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-lg text-slate-300 mb-2">by {book.author}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                {book.genre && <span>Genre: {book.genre}</span>}
                {book.publication_year && <span>Year: {book.publication_year}</span>}
                {book.isbn && <span>ISBN: {book.isbn}</span>}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(book.avg_rating, 5)}
                  <span className="ml-2 text-sm text-slate-400">{book.avg_rating.toFixed(1)} ({book.review_count} reviews)</span>
                </div>
                <Badge variant={book.is_borrowed ? 'destructive' : 'default'} className="text-sm">
                  {book.is_borrowed ? 'Borrowed' : 'Available'}
                </Badge>
              </div>
              {user && !book.is_borrowed && (
                <Button
                  onClick={() => {
                    API.post('/loans', { bookId: book.id })
                      .then(() => {
                        alert('Book borrowed successfully!');
                        fetchBook();
                      })
                      .catch((err) => alert(err.response?.data?.message || 'Failed to borrow'));
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-2 transition-all"
                >
                  Borrow this Book
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10 py-5">
            <CardTitle className="text-white text-xl font-bold">Reviews</CardTitle>
            <CardDescription className="text-slate-300">What readers think</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Review Form */}
            {user && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <Label className="text-slate-300">Your Rating:</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReviewRating(val)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${val <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <Label htmlFor="comment" className="text-slate-300">Comment (optional)</Label>
                  <Textarea
                    id="comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-2 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {review.avatar_url ? (
                          <img src={review.avatar_url} alt={review.username} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{review.username}</p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating, 4)}
                            <span className="text-xs text-slate-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user && (user.id === review.user_id || user.role === 'admin') && (
                        <div className="flex gap-2">
                          {user.id === review.user_id && (
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingReviewId === review.id ? (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setEditRating(val)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${val <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Update your comment..."
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-400 rounded-xl mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateReview(review.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-1 text-sm"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingReviewId(null)}
                            className="border-white/20 text-slate-200 hover:bg-white/10 rounded-xl px-4 py-1 text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      review.comment && <p className="text-slate-300 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}