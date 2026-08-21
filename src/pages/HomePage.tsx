import { Link } from 'react-router-dom';
import { useAuth } from '@/AuthContext';
import { ArrowRight, Star, BookOpen, User, Search, BookMarked, ListPlus } from 'lucide-react';

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-card { background: #FFFDF8; border: 1px solid #D9C9A3; border-radius: 6px; }
  .rr-card-top { border-top: 3px solid #1F4738; }
  .rr-stamp { transform: rotate(-4deg); border: 2px solid currentColor; border-radius: 3px; box-shadow: 0 0 0 1px currentColor inset; }
`;

const POPULAR_BOOKS = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', year: 1925, rating: 4.5, status: 'On Shelf' },
  { title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', year: 1965, rating: 4.8, status: 'Checked Out' },
  { title: '1984', author: 'George Orwell', genre: 'Dystopian', year: 1949, rating: 4.7, status: 'On Shelf' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', year: 1937, rating: 4.9, status: 'On Shelf' },
  { title: 'Harry Potter', author: 'J.K. Rowling', genre: 'Fantasy', year: 1997, rating: 4.6, status: 'Checked Out' },
];

export default function HomePage() {
  const { user } = useAuth();

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3 h-3 fill-[#A9852E] text-[#A9852E]" />
        ))}
        {halfStar === 1 && <Star className="w-3 h-3 fill-[#A9852E] text-[#A9852E]" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-[#C9BB9C]" />
        ))}
      </div>
    );
  };

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased flex flex-col">
      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>

      {user ? (
        /* --- LOGGED IN STATE --- */
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 py-12 text-center">
          <span className="rr-mono inline-flex items-center px-4 py-1.5 bg-[#EFE6D3] border border-[#D9C9A3] rounded-full text-[11px] uppercase tracking-[0.15em] text-[#6B5B3F] dark:dark:text-[#4A3F2A] mb-4">
            Welcome back, {user.username || user.email?.split('@')[0]}
          </span>
          <h1 className="rr-display text-3xl md:text-[2.2rem] leading-tight font-semibold tracking-tight text-[#1F4738] dark:text-[#8BA695] mb-4">
            Your Reading Room
          </h1>
          <p className="text-base text-[#6B5B3F] dark:text-[#A99A7A] max-w-xl mb-10">
            Manage your collection of books and discover the brilliant minds behind them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <Link
              to="/books"
              className="rr-card rr-card-top group relative p-8 text-left overflow-hidden shadow-[0_16px_32px_-24px_rgba(31,71,56,0.35)] hover:shadow-[0_18px_36px_-20px_rgba(31,71,56,0.4)] transition-shadow"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[#EFE6D3] rounded-full border border-[#D9C9A3] text-[#1F4738]">
                <BookOpen className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="rr-display text-xl font-semibold text-[#1F4738] mb-2">Books</h3>
              <p className="text-[#6B5B3F] text-sm mb-4">Browse, search, and manage your entire book collection.</p>
              <span className="rr-mono inline-flex items-center text-xs uppercase tracking-wide text-[#8A5A22] group-hover:translate-x-1 transition-transform">
                Explore Books
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </span>
            </Link>

            <Link
              to="/authors"
              className="rr-card rr-card-top group relative p-8 text-left overflow-hidden shadow-[0_16px_32px_-24px_rgba(31,71,56,0.35)] hover:shadow-[0_18px_36px_-20px_rgba(31,71,56,0.4)] transition-shadow"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[#EFE6D3] rounded-full border border-[#D9C9A3] text-[#1F4738]">
                <User className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="rr-display text-xl font-semibold text-[#1F4738] mb-2">Authors</h3>
              <p className="text-[#6B5B3F] text-sm mb-4">Discover the creators behind your favorite stories.</p>
              <span className="rr-mono inline-flex items-center text-xs uppercase tracking-wide text-[#8A5A22] group-hover:translate-x-1 transition-transform">
                Discover Authors
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </span>
            </Link>
          </div>
        </main>
      ) : (
        /* --- LOGGED OUT LANDING STATE --- */
        <div className="flex-1 flex flex-col">

          {/* Plaque header / nav */}
          <header className="bg-[#1F4738] relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border-2 border-[#B08968] flex items-center justify-center bg-[#173328]">
                    <BookOpen className="w-4 h-4 text-[#D9C08F]" strokeWidth={1.75} />
                  </div>
                  <span className="rr-display text-lg font-semibold text-[#F6F1E7] tracking-tight">The Reading Room</span>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                  <Link to="/books" className="rr-mono px-4 py-2 rounded-sm text-xs uppercase tracking-wide text-[#B9CDC1] hover:text-[#F6F1E7] hover:bg-white/5 transition-colors">Books</Link>
                  <Link to="/authors" className="rr-mono px-4 py-2 rounded-sm text-xs uppercase tracking-wide text-[#B9CDC1] hover:text-[#F6F1E7] hover:bg-white/5 transition-colors">Authors</Link>
                </nav>
                <div className="flex items-center gap-3">
                  <Link to="/login" className="rr-mono text-xs uppercase tracking-wide text-[#B9CDC1] hover:text-[#F6F1E7] transition-colors">Sign in</Link>
                  <Link to="/register" className="rr-mono bg-[#D9C08F] hover:bg-[#E5CE9F] text-[#1F4738] rounded-sm px-4 py-2 text-xs uppercase tracking-wide font-semibold transition-colors">Register</Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[#F6F1E7] dark:bg-[#0a0a0a]">

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 pt-12 pb-14 text-center">
              <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
              <span className="rr-mono inline-flex items-center px-4 py-1.5 bg-[#EFE6D3] border border-[#D9C9A3] rounded-full text-[11px] uppercase tracking-[0.15em] text-[#6B5B3F] mb-6">
                Now cataloguing new arrivals
              </span>
              <h1 className="rr-display text-2xl md:text-4xl leading-[1.1] tracking-tight text-[#1F4738] dark:text-[#8BA695] mb-5">
                A quieter way to keep<br className="hidden md:block" /> track of what you read
              </h1>
              <p className="text-base md:text-lg text-[#6B5B3F] dark:text-[#A99A7A] max-w-xl mx-auto mb-8">
                Browse the catalog, borrow with ease, and organize everything you're reading into shelves of your own.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/books"
                  className="rr-mono inline-flex items-center gap-2 bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm px-6 py-3 text-xs uppercase tracking-wide font-semibold transition-colors"
                >
                  Browse Collection
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/register"
                  className="rr-mono inline-flex items-center gap-2 border border-[#1F4738] text-[#1F4738] dark:text-[#8BA695] hover:bg-[#1F4738] hover:text-[#F6F1E7] rounded-sm px-6 py-3 text-xs uppercase tracking-wide font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </section>

            {/* Popular books ledger preview */}
            <section className="max-w-4xl mx-auto px-6 pb-16">
              <div className="rr-card overflow-hidden shadow-[0_24px_48px_-28px_rgba(31,71,56,0.4)]">
                <div className="border-b-2 border-[#1F4738] px-6 py-5">
                  <h2 className="rr-display text-[#1F4738] text-lg font-semibold">Popular Books</h2>
                  <p className="rr-mono text-[11px] text-[#8A7A54] dark:text-[#4A3F2A] tracking-wide mt-0.5">Trending titles recommended by our community</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1F4738]">
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#D9C08F] uppercase tracking-[0.12em]">Title</th>
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.12em]">Author</th>
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.12em] hidden sm:table-cell">Genre</th>
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.12em] hidden sm:table-cell">Year</th>
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.12em]">Rating</th>
                        <th className="rr-mono px-5 py-3 text-[10px] font-semibold text-[#B9CDC1] uppercase tracking-[0.12em] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {POPULAR_BOOKS.map((book, idx) => (
                        <tr key={book.title} className={`border-b border-[#E4D8BE] last:border-0 ${idx % 2 === 1 ? 'bg-[#F6F1E7]' : 'bg-[#FFFDF8]'}`}>
                          <td className="rr-display px-5 py-3 text-sm font-semibold text-[#1F4738]">{book.title}</td>
                          <td className="px-5 py-3 text-sm text-[#4A3F2A]">{book.author}</td>
                          <td className="rr-mono px-5 py-3 text-xs text-[#6B5B3F] hidden sm:table-cell">{book.genre}</td>
                          <td className="rr-mono px-5 py-3 text-xs text-[#6B5B3F] hidden sm:table-cell">{book.year}</td>
                          <td className="px-5 py-3">{renderStars(book.rating)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`rr-stamp rr-mono inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 ${book.status === 'On Shelf' ? 'text-[#1F4738]' : 'text-[#A63D2F]'}`}>
                              {book.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Feature strip */}
            <section className="bg-[#EFE6D3] border-y border-[#D9C9A3]">
              <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[#FFFDF8] border border-[#D9C9A3] flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#1F4738]" strokeWidth={1.75} />
                  </div>
                  <h3 className="rr-display text-lg font-semibold text-[#1F4738] mb-1.5">Search the Catalog</h3>
                  <p className="text-[#6B5B3F] dark:text-[#4A3F2A]  text-sm">Filter by title, author, genre, year, or ISBN to find exactly what you're after.</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[#FFFDF8] border border-[#D9C9A3] flex items-center justify-center">
                    <BookMarked className="w-5 h-5 text-[#1F4738]" strokeWidth={1.75} />
                  </div>
                  <h3 className="rr-display text-lg font-semibold text-[#1F4738] mb-1.5">Borrow with Ease</h3>
                  <p className="text-[#6B5B3F] dark:text-[#4A3F2A]  text-sm">Check books out in a click and keep track of every due date in one place.</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[#FFFDF8] border border-[#D9C9A3] flex items-center justify-center">
                    <ListPlus className="w-5 h-5 text-[#1F4738]" strokeWidth={1.75} />
                  </div>
                  <h3 className="rr-display text-lg font-semibold text-[#1F4738] mb-1.5">Curate Your Shelves</h3>
                  <p className="text-[#6B5B3F] dark:text-[#4A3F2A]  text-sm">Build custom reading lists and come back to them whenever you like.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-[#D9C9A3]">
        <p className="rr-mono text-center text-[11px] text-[#A99A7A] uppercase tracking-wide">
          © {new Date().getFullYear()} The Reading Room. All rights reserved.
        </p>
      </footer>
    </div>
  );
}