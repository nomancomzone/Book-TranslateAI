import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { BookCard } from '@/components/BookCard'
import { CATEGORIES, type Book } from '@/lib/types'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export const Route = createFileRoute('/books')({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
    q: (search.q as string) || undefined,
    sort: (search.sort as string) || 'popular',
    minPrice: (search.minPrice as string) || undefined,
    maxPrice: (search.maxPrice as string) || undefined,
  }),
  component: BooksPage,
})

function BooksPage() {
  const { category, q, sort, minPrice, maxPrice } = useSearch({ from: '/books' })
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(q || '')
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('search', q)
    if (sort) params.set('sort', sort)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)

    fetch(`/api/books?${params}`)
      .then((res) => res.json())
      .then((data) => { setBooks(data); setLoading(false); })
      .catch(() => setLoading(false))
  }, [category, q, sort, minPrice, maxPrice])

  const currentCategory = CATEGORIES.find((c) => c.id === category)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bengali-text">
            {currentCategory ? `${currentCategory.icon} ${currentCategory.nameBn}` : q ? `"${q}" এর ফলাফল` : 'সব বই'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {books.length} টি বই পাওয়া গেছে
          </p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors md:hidden">
          <SlidersHorizontal className="w-4 h-4" /> ফিল্টার
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'} md:block md:static md:w-64 md:shrink-0`}>
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h3 className="font-bold bengali-text">ফিল্টার</h3>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 bengali-text">খুঁজুন</label>
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/books?q=${localSearch}`; }}>
              <div className="flex">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="বই বা লেখক..."
                  className="flex-1 border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button type="submit" className="bg-[#1877F2] text-white px-3 rounded-r-lg">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 bengali-text">ক্যাটাগরি</label>
            <div className="space-y-1">
              <Link to="/books" search={{}} className={`block px-3 py-2 rounded-lg text-sm ${!category ? 'bg-[#1877F2] text-white' : 'hover:bg-gray-100'} bengali-text`}>
                সব বই
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to="/books"
                  search={{ category: cat.id }}
                  className={`block px-3 py-2 rounded-lg text-sm ${category === cat.id ? 'bg-[#1877F2] text-white' : 'hover:bg-gray-100'} bengali-text`}
                >
                  {cat.icon} {cat.nameBn}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 bengali-text">মূল্য পরিসীমা</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                placeholder="৳ থেকে"
                className="w-1/2 border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                placeholder="৳ পর্যন্ত"
                className="w-1/2 border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => { window.location.href = `/books?${category ? `category=${category}&` : ''}${localMinPrice ? `minPrice=${localMinPrice}&` : ''}${localMaxPrice ? `maxPrice=${localMaxPrice}` : ''}`; }}
              className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded-lg bengali-text"
            >
              ফিল্টার করুন
            </button>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 bengali-text">সাজান</label>
            <select
              value={sort}
              onChange={(e) => { window.location.href = `/books?sort=${e.target.value}${category ? `&category=${category}` : ''}`; }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="popular">জনপ্রিয়</option>
              <option value="new">নতুন</option>
              <option value="price-low">মূল্য: কম → বেশি</option>
              <option value="price-high">মূল্য: বেশি → কম</option>
              <option value="rating">রেটিং</option>
            </select>
          </div>
        </aside>

        {/* Books Grid */}
        <div className="flex-1">
          {/* Sort bar - desktop */}
          <div className="hidden md:flex items-center justify-between mb-4 bg-white rounded-lg p-3 border">
            <span className="text-sm text-gray-500 bengali-text">{books.length} টি বই</span>
            <select
              value={sort}
              onChange={(e) => { window.location.href = `/books?sort=${e.target.value}${category ? `&category=${category}` : ''}${q ? `&q=${q}` : ''}`; }}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="popular">জনপ্রিয়</option>
              <option value="new">নতুন</option>
              <option value="price-low">মূল্য: কম → বেশি</option>
              <option value="price-high">মূল্য: বেশি → কম</option>
              <option value="rating">রেটিং</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">📚</p>
              <h3 className="text-xl font-bold mb-2 bengali-text">কোনো বই পাওয়া যায়নি</h3>
              <p className="text-gray-500 bengali-text">অন্য কীওয়ার্ড দিয়ে খুঁজুন</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
