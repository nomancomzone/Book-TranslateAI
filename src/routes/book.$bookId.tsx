import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { addToCart } from '@/lib/store'
import { BookCard } from '@/components/BookCard'
import type { Book, Review } from '@/lib/types'
import { Star, ShoppingCart, CreditCard, Clock, Users, BookOpen, Quote, ChevronDown, ChevronUp, User } from 'lucide-react'

export const Route = createFileRoute('/book/$bookId')({
  component: BookDetailPage,
})

function BookDetailPage() {
  const { bookId } = useParams({ from: '/book/$bookId' })
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullSummary, setShowFullSummary] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewPages, setPreviewPages] = useState<string[]>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetch(`/api/books/detail?id=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data)
        setPreviewPages(data.previewPages || [])
        setLoading(false)
        if (data.relatedBookIds?.length) {
          Promise.all(
            data.relatedBookIds.map((id: string) =>
              fetch(`/api/books/detail?id=${id}`).then((r) => r.ok ? r.json() : null)
            )
          ).then((books) => setRelatedBooks(books.filter(Boolean)))
        }
      })
      .catch(() => setLoading(false))

    fetch(`/api/reviews?bookId=${bookId}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch(() => {})
  }, [bookId])

  const handleBuyNow = () => {
    if (!isAuthenticated) { loginWithGoogle(); return; }
    addToCart(bookId)
    window.location.href = '/checkout'
  }

  const handleAddToCart = () => {
    addToCart(bookId)
  }

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, rating: reviewRating, comment: reviewText }),
      })
      if (res.ok) {
        setReviewText('')
        setReviewRating(5)
        alert('আপনার রিভিউ জমা হয়েছে। অনুমোদনের পর প্রদর্শিত হবে।')
      }
    } catch {} finally { setSubmittingReview(false) }
  }

  const moodColors: Record<string, string> = {
    motivational: 'bg-green-100 text-green-700',
    sad: 'bg-blue-100 text-blue-700',
    funny: 'bg-yellow-100 text-yellow-700',
    informative: 'bg-purple-100 text-purple-700',
    thriller: 'bg-red-100 text-red-700',
    romantic: 'bg-pink-100 text-pink-700',
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid md:grid-cols-3 gap-8">
          <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">📚</p>
        <h2 className="text-2xl font-bold bengali-text">বই পাওয়া যায়নি</h2>
        <Link to="/books" className="text-[#1877F2] hover:underline mt-4 inline-block bengali-text">সব বই দেখুন</Link>
      </div>
    )
  }

  const totalRatings = book.ratingBreakdown ? Object.values(book.ratingBreakdown).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#1877F2]">হোম</Link>
        <span>/</span>
        <Link to="/books" search={{ category: book.category }} className="hover:text-[#1877F2] bengali-text">{book.categoryBn}</Link>
        <span>/</span>
        <span className="text-gray-700 bengali-text">{book.titleBn}</span>
      </nav>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div>
          <div className="sticky top-24">
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-lg">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <span className="text-7xl mb-4">📖</span>
                  <p className="text-center text-lg font-bold text-blue-800 bengali-text">{book.titleBn}</p>
                  <p className="text-center text-sm text-blue-600 mt-2 bengali-text">{book.authorBn}</p>
                </div>
              )}
            </div>
            {/* Action buttons */}
            <div className="mt-4 space-y-3">
              <button onClick={handleAddToCart} className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors bengali-text">
                <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
              </button>
              <button onClick={handleBuyNow} className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-colors bengali-text">
                <CreditCard className="w-5 h-5" /> এখনই কিনুন
              </button>
              <button onClick={() => setPreviewOpen(true)} className="w-full flex items-center justify-center gap-2 border-2 border-[#1877F2] text-[#1877F2] hover:bg-blue-50 py-3 rounded-xl font-medium transition-colors bengali-text">
                <BookOpen className="w-5 h-5" /> ফ্রি প্রিভিউ পড়ুন
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Title & Meta */}
          <div>
            <h1 className="text-3xl font-bold bengali-text">{book.titleBn}</h1>
            <p className="text-gray-500 mt-1">{book.title}</p>
            <p className="text-lg text-gray-600 mt-2 bengali-text">লেখক: <span className="text-gray-900 font-medium">{book.authorBn}</span></p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(book.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="font-bold ml-1">{book.rating?.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({totalRatings})</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-gray-500 text-sm"><Users className="w-4 h-4" /> {book.totalReaders} জন পড়েছেন</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-gray-500 text-sm"><Clock className="w-4 h-4" /> {book.readingTime}</span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-[#1877F2]">৳{book.price}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">৳{book.originalPrice}</span>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full font-medium">
                    {Math.round((1 - book.price / book.originalPrice) * 100)}% ছাড়
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tags & Category */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1877F2]/10 text-[#1877F2] px-3 py-1 rounded-full text-sm font-medium bengali-text">{book.categoryBn}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${moodColors[book.mood] || 'bg-gray-100 text-gray-700'} bengali-text`}>
              {book.moodBn}
            </span>
            {book.tagsBn?.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm bengali-text">{tag}</span>
            ))}
          </div>

          {/* Main Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-sm text-[#1877F2] mb-2 bengali-text">📌 মূল বার্তা</h3>
            <p className="text-lg font-medium bengali-text">{book.mainMessageBn}</p>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-xl font-bold mb-3 bengali-text">📝 সারসংক্ষেপ</h3>
            <div className={`bengali-text text-gray-700 leading-relaxed ${!showFullSummary ? 'line-clamp-3' : ''}`}>
              {book.summaryBn}
            </div>
            <button onClick={() => setShowFullSummary(!showFullSummary)} className="text-[#1877F2] text-sm mt-2 flex items-center gap-1 bengali-text">
              {showFullSummary ? <><ChevronUp className="w-4 h-4" /> সংক্ষেপ করুন</> : <><ChevronDown className="w-4 h-4" /> পুরোটা পড়ুন</>}
            </button>
          </div>

          {/* Key Points */}
          <div>
            <h3 className="text-xl font-bold mb-3 bengali-text">🔑 মূল বিষয়গুলো</h3>
            <ul className="space-y-2">
              {book.keyPointsBn?.map((point, i) => (
                <li key={i} className="flex items-start gap-3 bengali-text">
                  <span className="bg-[#1877F2] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who is this for */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-bold mb-2 bengali-text">👥 এই বইটি কাদের জন্য</h3>
            <p className="text-gray-700 bengali-text">{book.targetAudienceBn}</p>
          </div>

          {/* Quotes */}
          {book.quotes?.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 bengali-text">💬 বিখ্যাত উক্তি</h3>
              <div className="space-y-4">
                {book.quotes.map((quote, i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-xl border-l-4 border-[#1877F2]">
                    <Quote className="w-8 h-8 text-[#1877F2]/30 mb-2" />
                    <p className="text-lg font-medium bengali-text mb-2">{quote.textBn}</p>
                    <p className="text-sm text-gray-500 italic">{quote.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Author */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3 bengali-text">✍️ লেখক সম্পর্কে</h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#1877F2]/10 rounded-full flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-[#1877F2]" />
              </div>
              <div>
                <p className="font-bold bengali-text">{book.authorBn}</p>
                <p className="text-sm text-gray-500">{book.author}</p>
                <p className="text-gray-700 mt-2 bengali-text">{book.aboutAuthorBn}</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div>
            <h3 className="text-xl font-bold mb-4 bengali-text">⭐ রেটিং</h3>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-[#1877F2]">{book.rating?.toFixed(1)}</p>
                <div className="flex justify-center mt-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(book.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{totalRatings} রেটিং</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map((star) => {
                  const count = book.ratingBreakdown?.[`star${star}` as keyof typeof book.ratingBreakdown] || 0
                  const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-xl font-bold mb-4 bengali-text">💬 পাঠক রিভিউ</h3>
            {isAuthenticated && (
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <h4 className="font-medium mb-3 bengali-text">আপনার রিভিউ লিখুন</h4>
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={`w-6 h-6 ${s <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="এই বই সম্পর্কে আপনার মতামত..."
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none bengali-text"
                  rows={3}
                />
                <button onClick={submitReview} disabled={submittingReview} className="mt-2 bg-[#1877F2] text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 bengali-text">
                  {submittingReview ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
                </button>
              </div>
            )}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(review.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <p className="text-gray-700 text-sm bengali-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm bengali-text">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ লিখুন!</p>
            )}
          </div>
        </div>
      </div>

      {/* Free Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-[#1877F2] text-white">
              <h3 className="font-bold bengali-text">📖 ফ্রি প্রিভিউ - {book.titleBn}</h3>
              <button onClick={() => setPreviewOpen(false)} className="hover:bg-blue-600 p-1 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {previewPages.map((page, i) => (
                <div key={i} className="mb-8 pb-8 border-b last:border-0">
                  <p className="text-xs text-gray-400 mb-3">পৃষ্ঠা {i + 1} / {previewPages.length}</p>
                  <div className="bengali-text text-gray-800 leading-relaxed whitespace-pre-line">{page}</div>
                </div>
              ))}
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-xl mb-3 bengali-text font-medium">📚 বাকি অংশ পড়তে বইটি কিনুন</p>
                <button onClick={() => { setPreviewOpen(false); handleBuyNow(); }} className="bg-[#FF6B35] text-white px-8 py-3 rounded-xl font-medium bengali-text">
                  ৳{book.price} দিয়ে কিনুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 bengali-text">📚 সম্পর্কিত বই</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
