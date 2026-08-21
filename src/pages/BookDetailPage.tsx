import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '@/api';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, Edit, Trash2, Plus, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddToListPopover from '@/components/AddToListPopover';

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

  const canModify = user && ['admin', 'librarian'].includes(user.role);

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
      await fetchReviews();
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

  const handleDeleteBook = async () => {
    if (!canModify) return;
    if (!window.confirm(`Remove "${book?.title}" from the catalog?`)) return;
    try {
      await API.delete(`/books/${id}`);
      navigate('/books');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const renderStars = (rating: number) => {
    const numRating = Number(rating) || 0;
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-[#A9852E] text-[#A9852E]" />
        ))}
        {halfStar === 1 && <Star className="w-3.5 h-3.5 fill-[#A9852E] text-[#A9852E]" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-[#C9BB9C]" />
        ))}
        <span className="ml-1.5 font-mono text-[11px] text-[#6B5B3F]">{numRating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rr-scope min-h-screen bg-[#F6F1E7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
          <span className="rr-mono text-[11px] uppercase tracking-[0.2em] text-[#8A7A54]">Loading details…</span>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="rr-scope min-h-screen bg-[#F6F1E7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4A3F2A] text-xl">{error || 'Book not found'}</p>
          <Link to="/books" className="rr-mono text-[#1F4738] hover:text-[#0F2A20] underline decoration-[#1F4738]/30 underline-offset-4 mt-4 inline-block">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');

        .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
        .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }

        .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
        .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
        .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }

        .rr-paper {
          background-color: #F6F1E7;
          background-image: radial-gradient(#00000008 0.6px, transparent 0.6px);
          background-size: 14px 14px;
        }

        .rr-stamp {
          transform: rotate(-4deg);
          border: 2px solid currentColor;
          border-radius: 3px;
          box-shadow: 0 0 0 1px currentColor inset;
        }

        .rr-ruled-input {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #C9BB9C;
          border-radius: 0;
          padding-left: 2px;
          color: #241C10;
        }
        .rr-ruled-input::placeholder { color: #A99A7A; }
        .rr-ruled-input:focus {
          outline: none;
          box-shadow: none;
          border-bottom-color: #B08968;
          border-bottom-width: 2px;
        }

        .rr-corner {
          position: relative;
          background: #FFFDF8;
          padding: 3px;
          border: 1px solid #E4D8BE;
        }

        @media (prefers-reduced-motion: no-preference) {
          .rr-fade-in { animation: rr-fade-up 0.4s ease both; }
        }
        @keyframes rr-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rr-divider {
          border: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #D9C9A3, transparent);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.3] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat" />

        {/* Plaque header */}
        <div className="rr-display bg-[#1F4738] rounded-t-md relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-9 py-7">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full border-2 border-[#B08968] flex items-center justify-center shrink-0 bg-[#173328]">
                <BookOpen className="w-5 h-5 text-[#D9C08F]" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-3xl md:text-[2.4rem] leading-none font-semibold tracking-tight text-[#F6F1E7]">
                  The Reading Room
                </h1>
                <p className="rr-mono text-[11px] tracking-[0.2em] uppercase text-[#B9CDC1] mt-2">
                  Book Details
                </p>
              </div>
            </div>
            <Link
              to="/books"
              className="rr-mono inline-flex items-center gap-2 bg-[#D9C08F] hover:bg-[#E5CE9F] text-[#1F4738] rounded-sm px-4 py-2 transition-colors font-semibold text-xs uppercase tracking-wider shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              Back to Catalog
            </Link>
          </div>
        </div>

        {/* Book Details Card */}
        <Card className="border border-[#D9C9A3] shadow-[0_10px_30px_-18px_rgba(31,71,56,0.4)] bg-[#FFFDF8] rounded-b-md rounded-t-none overflow-hidden -mt-[1px]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover */}
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                <div className="rr-corner w-48 h-auto shadow-sm">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-auto object-cover" />
                  ) : (
                    <div className="w-48 h-64 bg-[#EFE6D3] flex items-center justify-center text-[#8A7A54] text-sm font-medium">No cover</div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="rr-display text-3xl font-semibold text-[#1F4738] leading-tight">{book.title}</h2>
                  <p className="text-lg text-[#4A3F2A] mt-1">by <span className="font-medium">{book.author}</span></p>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 rr-mono text-[11px] uppercase tracking-wide text-[#6B5B3F]">
                  {book.genre && <span>Genre: <span className="text-[#1F4738]">{book.genre}</span></span>}
                  {book.publication_year && <span>Year: <span className="text-[#1F4738]">{book.publication_year}</span></span>}
                  {book.isbn && <span>ISBN: <span className="text-[#1F4738]">{book.isbn}</span></span>}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    {book.review_count > 0 ? (
                      renderStars(book.avg_rating)
                    ) : (
                      <span className="rr-mono text-[10px] text-[#B3A582] uppercase tracking-wide">Not yet rated</span>
                    )}
                    <span className="rr-mono text-[11px] text-[#6B5B3F] ml-2">
                      ({book.review_count} review{book.review_count !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <span className={`rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 ${book.is_borrowed ? 'text-[#A63D2F]' : 'text-[#1F4738]'}`}>
                    {book.is_borrowed ? 'Checked Out' : 'On Shelf'}
                  </span>
                </div>

                {user && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {!book.is_borrowed && (
                      <Button
                        onClick={async () => {
                          try {
                            await API.post('/loans', { bookId: book.id });
                            alert('Book checked out successfully!');
                            fetchBook();
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Failed to borrow');
                          }
                        }}
                        className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-5 h-9 text-xs uppercase tracking-wider font-semibold shadow-sm"
                      >
                        Check Out
                      </Button>
                    )}
                    <AddToListPopover
                      bookId={book.id}
                      trigger={
                        <Button
                          variant="outline"
                          className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] hover:text-[#1F4738] rounded-sm h-9 px-4 text-xs uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" />
                          Add to List
                        </Button>
                      }
                    />
                    {canModify && (
                      <>
                        <Link to={`/books/${book.id}/edit`}>
                          <Button
                            variant="outline"
                            className="rr-mono border-[#D9C9A3] text-[#1F4738] hover:bg-[#1F4738] hover:text-[#F6F1E7] rounded-sm h-9 px-4 text-xs uppercase tracking-wider"
                          >
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={handleDeleteBook}
                          className="rr-mono border-[#A63D2F]/40 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-[#F6F1E7] rounded-sm h-9 px-4 text-xs uppercase tracking-wider"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border border-[#D9C9A3] shadow-[0_10px_30px_-18px_rgba(31,71,56,0.3)] bg-[#FFFDF8] rounded-md mt-8 overflow-hidden">
          <CardHeader className="bg-[#FFFDF8] border-b-2 border-[#1F4738] py-4 px-7">
            <CardTitle className="rr-display text-[#1F4738] text-xl font-semibold tracking-tight">Reader Reviews</CardTitle>
            <CardDescription className="rr-mono text-[11px] text-[#8A7A54] tracking-wide">What the community thinks</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Review Form */}
            {user && (
              <form onSubmit={handleSubmitReview} className="p-4 bg-[#F6F1E7] border border-[#D9C9A3] rounded-sm">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <Label className="rr-mono text-[11px] text-[#6B5B3F] uppercase tracking-wide">Your Rating:</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReviewRating(val)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${val <= reviewRating ? 'fill-[#A9852E] text-[#A9852E]' : 'text-[#C9BB9C]'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <Label htmlFor="comment" className="rr-mono text-[11px] text-[#6B5B3F] uppercase tracking-wide">Comment (optional)</Label>
                  <Textarea
                    id="comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    className="rr-ruled-input w-full min-h-[80px] resize-y text-sm pt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-5 h-9 text-xs uppercase tracking-wider font-semibold shadow-sm"
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </Button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-center text-[#8A7A54] rr-mono text-[11px] uppercase tracking-wide py-6">No reviews yet — be the first to leave one.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-[#E4D8BE] pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {review.avatar_url ? (
                          <img src={review.avatar_url} alt={review.username} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#1F4738] flex items-center justify-center text-[#F6F1E7] rr-display font-semibold text-sm">
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#241C10]">{review.username}</p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="rr-mono text-[10px] text-[#8A7A54]">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {(user && (user.id === review.user_id || user.role === 'admin')) && (
                        <div className="flex gap-2">
                          {user.id === review.user_id && (
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-[#6B5B3F] hover:text-[#1F4738] transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-[#A63D2F] hover:text-[#7A2C21] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingReviewId === review.id ? (
                      <div className="mt-3 p-3 bg-[#F6F1E7] border border-[#D9C9A3] rounded-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setEditRating(val)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${val <= editRating ? 'fill-[#A9852E] text-[#A9852E]' : 'text-[#C9BB9C]'}`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Update your comment…"
                          className="rr-ruled-input w-full min-h-[60px] resize-y text-sm pt-1 mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateReview(review.id)}
                            className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-4 h-8 text-xs uppercase tracking-wider font-semibold"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingReviewId(null)}
                            className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm px-4 h-8 text-xs uppercase tracking-wider"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      review.comment && <p className="text-[#4A3F2A] mt-2 text-sm leading-relaxed">{review.comment}</p>
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