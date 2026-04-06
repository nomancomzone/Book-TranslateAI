import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { addToCart } from '@/lib/store'
import { BookCard } from '@/components/BookCard'
import type { Book, Review } from '@/lib/types'
import { Star, ShoppingCart, CreditCard, Clock, Users, BookOpen, Quote, ChevronDown, ChevronUp, User, Tag, Edit2, Trash2 } from 'lucide-react'

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
  const [previewIndex, setPreviewIndex] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [bookOwned, setBookOwned] = useState(false)

  useEffect(() => {
    fetch(`/api/books/detail?id=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data)
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

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/user-data')
      .then(r => r.json())
      .then(data => { if (data.purchasedBooks?.includes(bookId)) setBookOwned(true) })
      .catch(() => {})
  }, [isAuthenticated, bookId])

  const applyCoupon = () => {
    if (!book) return
    if (couponCode.trim().toUpperCase() === 'NOMANY100') {
      setCouponApplied(true)
      alert('✅ কুপন কোড সফলভাবে প্রয়োগ হয়েছে! ১০০% ছাড় পেয়েছেন।')
    } else {
      alert('❌ ভুল কুপন কোড!')
    }
  }

  const addToLibrary = async () => {
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-to-library', bookId }),
      })
      setBookOwned(true)
    } catch (e) {
      console.error('Library add error:', e)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) { loginWithGoogle(); return }
    if (couponApplied) {
      await addToLibrary()
      alert('✅ বইটি আপনার লাইব্রেরিতে যোগ হয়েছে!')
      window.location.href = `/read/${bookId}`
      return
    }
    if (bookOwned) { window.location.href = `/read/${bookId}`; return }
    addToCart(bookId)
    window.location.href = '/checkout'
  }

  const handleAddToCart = () => {
    if (bookOwned) { window.location.href = `/read/${bookId}`; return }
    addToCart(bookId)
  }

  const submitReview = async () => {
    if (!reviewText.trim()) return
    if (!isAuthenticated) { loginWithGoogle(); return }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
          'x-user-name': user?.name || '',
        },
        body: JSON.stringify({ bookId, rating: reviewRating, comment: reviewText, editId: editingReviewId }),
      })
      if (res.ok) {
        const updated = await res.json()
        if (editingReviewId) {
          setReviews(prev => prev.map(r => r.id === editingReviewId ? updated : r))
        } else {
          setReviews(prev => [...prev, updated])
        }
        setReviewText('')
        setReviewRating(5)
        setEditingReviewId(null)
        alert(editingReviewId ? '✅ রিভিউ আপডেট হয়েছে!' : '✅ রিভিউ জমা হয়েছে!')
      }
    } catch {} finally { setSubmittingReview(false) }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('এই রিভিউ মুছে ফেলতে চান?')) return
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({ bookId, reviewId }),
      })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        alert('✅ রিভিউ মুছে ফেলা হয়েছে!')
      }
    } catch {}
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
  const previewImages = (book as any).previewImages || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#1877F2]">হোম</Link>
        <span>/</span>
        <Link to="/books" search={{ category: book.category }} className="hover:text-[#1877F2] bengali-text">{book.categoryBn}</Link>
        <span>/</span>
        <span className="text-gray-700 bengali-text">{book.titleBn}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-3">
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-lg">
              {(book as any).coverImage ? (
                <img src={`/api/cover?bookId=${book.id}`} alt={book.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <span className="text-7xl mb-4">📖</span>
                  <p className="text-center text-lg font-bold text-blue-800 bengali-text">{book.titleBn}</p>
                  <p className="text-center text-sm text-blue-600 mt-2 bengali-text">{book.authorBn}</p>
                </div>
              )}
            </div>

            {bookOwned ? (
              <button onClick={() => window.location.href = `/read/${bookId}`}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors bengali-text">
                <BookOpen className="w-5 h-5" /> বই পড়ুন
              </button>
            ) : (
              <>
                <button onClick={handleAddToCart} className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors bengali-text">
                  <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
                </button>
                <button onClick={handleBuyNow} className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-colors bengali-text">
                  <CreditCard className="w-5 h-5" /> {couponApplied ? 'বিনামূল্যে নিন' : 'এখনই কিনুন'}
                </button>
              </>
            )}

            {previewImages.length > 0 && (
              <button onClick={() => setPreviewOpen(true)} className="w-full flex items-center justify-center gap-2 border-2 border-[#1877F2] text-[#1877F2] hover:bg-blue-50 py-3 rounded-xl font-medium transition-colors bengali-text">
                <BookOpen className="w-5 h-5" /> ফ্রি প্রিভিউ পড়ুন
              </button>
            )}

            {!bookOwned && (
              <div className="p-4 bg-gray-50 rounded-xl border">
                <p className="text-sm font-medium mb-2 bengali-text flex items-center gap-1">
                  <Tag className="w-4 h-4" /> কুপন কোড আছে?
                </p>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="কোড লিখুন"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    disabled={couponApplied} />
                  <button onClick={applyCoupon} disabled={couponApplied || !couponCode.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 bengali-text">
                    {couponApplied ? '✅' : 'প্রয়োগ'}
                  </button>
                </div>
                {couponApplied && <p className="text-green-600 text-sm mt-2 bengali-text">✅ ১০০% ছাড় প্রয়োগ হয়েছে!</p>}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
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
              {bookOwned ? (
                <span className="text-2xl font-bold text-green-600 bengali-text">✅ আপনার লাইব্রেরিতে আছে</span>
              ) : couponApplied ? (
                <>
                  <span className="text-3xl font-bold text-green-600">বিনামূল্যে</span>
                  <span className="text-lg text-gray-400 line-through">৳{book.price}</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-[#1877F2]">৳{book.price}</span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">৳{book.originalPrice}</span>
                      <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full font-medium">
                        {Math.round((1 - book.price / book.originalPrice) * 100)}% ছাড়
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1877F2]/10 text-[#1877F2] px-3 py-1 rounded-full text-sm font-medium bengali-text">{book.categoryBn}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${moodColors[book.mood] || 'bg-gray-100 text-gray-700'} bengali-text`}>{book.moodBn}</span>
            {book.tagsBn?.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm bengali-text">{tag}</span>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-sm text-[#1877F2] mb-2 bengali-text">📌 মূল বার্তা</h3>
            <p className="text-lg font-medium bengali-text">{book.mainMessageBn}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3 bengali-text">📝 সারসংক্ষেপ</h3>
            <div className={`bengali-text text-gray-700 leading-relaxed ${!showFullSummary ? 'line-clamp-3' : ''}`}>{book.summaryBn}</div>
            <button onClick={() => setShowFullSummary(!showFullSummary)} className="text-[#1877F2] text-sm mt-2 flex items-center gap-1 bengali-text">
              {showFullSummary ? <><ChevronUp className="w-4 h-4" /> সংক্ষেপ করুন</> : <><ChevronDown className="w-4 h-4" /> পুরোটা পড়ুন</>}
            </button>
          </div>

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

          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-bold mb-2 bengali-text">👥 এই বইটি কাদের জন্য</h3>
            <p className="text-gray-700 bengali-text">{book.targetAudienceBn}</p>
          </div>

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
              <div id="review-form" className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                <h4 className="font-medium mb-3 bengali-text">
                  {editingReviewId ? '✏️ রিভিউ সম্পাদনা করুন' : 'আপনার রিভিউ লিখুন'}
                </h4>
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
                <div className="flex gap-2 mt-2">
                  <button onClick={submitReview} disabled={submittingReview}
                    className="bg-[#1877F2] text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 bengali-text">
                    {submittingReview ? 'জমা হচ্ছে...' : editingReviewId ? 'আপডেট করুন' : 'রিভিউ জমা দিন'}
                  </button>
                  {editingReviewId && (
                    <button onClick={() => { setEditingReviewId(null); setReviewText(''); setReviewRating(5) }}
                      className="border px-4 py-2 rounded-lg text-sm bengali-text bg-white">
                      বাতিল
                    </button>
                  )}
                </div>
              </div>
            )}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className={`bg-white border rounded-xl p-4 ${editingReviewId === review.id ? 'border-blue-300 bg-blue-50' : ''}`}>
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
                      {user?.email === (review as any).userEmail && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => {
                              setEditingReviewId(review.id)
                              setReviewText(review.comment)
                              setReviewRating(review.rating)
                              setTimeout(() => {
                                document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }, 100)
                            }}
                            className="flex items-center gap-1 text-xs text-[#1877F2] hover:underline bengali-text"
                          >
                            <Edit2 className="w-3 h-3" /> সম্পাদনা
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:underline bengali-text"
                          >
                            <Trash2 className="w-3 h-3" /> মুছুন
                          </button>
                        </div>
                      )}
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

      {previewOpen && previewImages.length > 0 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-[#1877F2] text-white">
              <h3 className="font-bold bengali-text">📖 ফ্রি প্রিভিউ - {book.titleBn}</h3>
              <button onClick={() => setPreviewOpen(false)} className="hover:bg-blue-600 p-1 rounded">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <img src={previewImages[previewIndex]} alt={`প্রিভিউ ${previewIndex + 1}`} className="w-full object-contain" />
            </div>
            <div className="p-4 border-t flex items-center justify-between bg-gray-50">
              <button onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))} disabled={previewIndex === 0}
                className="px-4 py-2 bg-[#1877F2] text-white rounded-lg disabled:opacity-40 bengali-text text-sm">← আগের পাতা</button>
              <span className="text-sm text-gray-500 bengali-text">{previewIndex + 1} / {previewImages.length}</span>
              {previewIndex < previewImages.length - 1 ? (
                <button onClick={() => setPreviewIndex(previewIndex + 1)}
                  className="px-4 py-2 bg-[#1877F2] text-white rounded-lg bengali-text text-sm">পরের পাতা →</button>
              ) : (
                <button onClick={() => { setPreviewOpen(false); handleBuyNow() }}
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg bengali-text text-sm">৳{book.price} দিয়ে কিনুন</button>
              )}
            </div>
          </div>
        </div>
      )}

      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 bengali-text">📚 সম্পর্কিত বই</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedBooks.map((b) => (<BookCard key={b.id} book={b} />))}
          </div>
        </section>
      )}
    </div>
  )
}