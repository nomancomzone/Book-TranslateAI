import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { BookCard } from '@/components/BookCard'
import { CATEGORIES, type Book } from '@/lib/types'
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const heroSlides = [
  {
    title: 'বিশ্বসেরা বই বাংলায় পড়ুন',
    subtitle: 'Read World\'s Best Books in Bengali',
    desc: 'হাজারো বইয়ের সংগ্রহ থেকে আপনার পছন্দের বই বেছে নিন',
    bg: 'from-[#1877F2] to-[#1565C0]',
    cta: 'বই দেখুন',
    ctaLink: '/books',
  },
  {
    title: 'নতুন বই প্রতি সপ্তাহে',
    subtitle: 'New Books Every Week',
    desc: 'আত্মউন্নয়ন, উপন্যাস, ইসলামিক, বিজ্ঞান — সব ক্যাটাগরিতে নতুন বই',
    bg: 'from-[#FF6B35] to-[#E65100]',
    cta: 'নতুন বই',
    ctaLink: '/books?sort=new',
  },
  {
    title: 'আপনা পছন্দের বই পড়ুন বাংলা ভাষায়',
    subtitle: 'Read your favorite book in Bengali',
    desc: 'আপনার পছন্দের বইয়ের বাংলা ভার্শন পেতে বই ও লেখকের নাম লিখে উইশ করুন — আমরা দ্রুতই নিয়ে আসব!',
    bg: 'from-[#00C853] to-[#2E7D32]',
    cta: '♡ উইশলিস্টে যান',
    ctaLink: '/wishlist',
  },
]

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => { setBooks(data); setLoading(false); })
      .catch(() => setLoading(false))
  }, [])

  const popularBooks = [...books].sort((a, b) => (b.totalReaders || 0) - (a.totalReaders || 0)).slice(0, 6)
  const newBooks = [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-r ${heroSlides[currentSlide].bg} transition-all duration-700`}>
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center text-white max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 bengali-text">
                {heroSlides[currentSlide].title}
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-2">
                {heroSlides[currentSlide].subtitle}
              </p>
              <p className="text-white/70 mb-8 bengali-text">
                {heroSlides[currentSlide].desc}
              </p>
              <Link
                to={heroSlides[currentSlide].ctaLink}
                className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors bengali-text"
              >
                {heroSlides[currentSlide].cta}
              </Link>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to="/books"
              search={{ category: cat.id }}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl hover:shadow-md hover:border-[#1877F2] border border-transparent transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs text-center text-gray-600 bengali-text group-hover:text-[#1877F2]">{cat.nameBn}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Books */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
            <h2 className="text-2xl font-bold bengali-text">জনপ্রিয় বই</h2>
            <span className="text-gray-400 text-sm ml-2">Most Popular</span>
          </div>
          <Link to="/books" search={{ sort: 'popular' }} className="text-[#1877F2] hover:underline text-sm bengali-text">
            সব দেখুন →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00C853]" />
            <h2 className="text-2xl font-bold bengali-text">নতুন বই</h2>
            <span className="text-gray-400 text-sm ml-2">New Arrivals</span>
          </div>
          <Link to="/books" search={{ sort: 'new' }} className="text-[#1877F2] hover:underline text-sm bengali-text">
            সব দেখুন →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {newBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Category-wise sections */}
      {CATEGORIES.slice(0, 4).map((cat) => {
        const catBooks = books.filter((b) => b.category === cat.id).slice(0, 6)
        if (catBooks.length === 0) return null
        return (
          <section key={cat.id} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-2xl font-bold bengali-text">{cat.nameBn}</h2>
              </div>
              <Link to="/books" search={{ category: cat.id }} className="text-[#1877F2] hover:underline text-sm bengali-text">
                সব দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {catBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )
      })}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#1877F2] to-[#1565C0] py-16 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4 bengali-text">আজই শুরু করুন পড়া!</h2>
          <p className="text-white/80 mb-8 bengali-text">হাজারো বাংলা বই আপনার হাতের মুঠোয়</p>
          <Link to="/books" className="inline-block bg-white text-[#1877F2] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors bengali-text">
            বই দেখুন
          </Link>
        </div>
      </section>
    </div>
  )
}
