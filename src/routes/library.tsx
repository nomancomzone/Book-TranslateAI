import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BookOpen, Clock } from 'lucide-react'
import type { Book } from '@/lib/types'

export const Route = createFileRoute('/library')({
  component: LibraryPage,
})

function LibraryPage() {
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [progress, setProgress] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    Promise.all([
      fetch('/api/user-data').then(r => r.json()),
      fetch('/api/reading-progress').then(r => r.json()),
    ]).then(async ([userData, readingProgress]) => {
      setProgress(readingProgress || {})
      const purchasedIds = userData.purchasedBooks || []
      const bookDetails = await Promise.all(
        purchasedIds.map((id: string) => fetch(`/api/books/detail?id=${id}`).then(r => r.ok ? r.json() : null))
      )
      setBooks(bookDetails.filter(Boolean))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">আমার লাইব্রেরি</h2>
          <p className="text-gray-500 mb-6 bengali-text">আপনার কেনা বইগুলো দেখতে লগইন করুন</p>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg">Google দিয়ে লগইন করুন</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 bengali-text">আমার লাইব্রেরি</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 bengali-text">আপনার লাইব্রেরি খালি</h3>
          <p className="text-gray-500 mb-6 bengali-text">এখনো কোনো বই কেনেননি</p>
          <Link to="/books" className="bg-[#1877F2] text-white px-6 py-3 rounded-lg inline-block bengali-text">বই কিনুন</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => {
            const p = progress[book.id]
            return (
              <Link key={book.id} to="/read/$bookId" params={{ bookId: book.id }} className="flex gap-4 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
                <div className="w-20 h-28 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  {book.coverImage ? <img src={book.coverImage} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">📖</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold bengali-text line-clamp-2">{book.titleBn}</h3>
                  <p className="text-sm text-gray-500 bengali-text">{book.authorBn}</p>
                  {p && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="bengali-text">{p.progress || 0}% পড়া হয়েছে</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.lastRead ? new Date(p.lastRead).toLocaleDateString('bn-BD') : ''}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#1877F2] h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                    </div>
                  )}
                  <span className="inline-block mt-2 text-[#1877F2] text-sm font-medium bengali-text">পড়া চালিয়ে যান →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
