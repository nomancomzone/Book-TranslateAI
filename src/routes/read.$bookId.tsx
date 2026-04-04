import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sun, Moon, Plus, Minus, Bookmark, ArrowLeft, BookOpen } from 'lucide-react'
import type { Book } from '@/lib/types'

export const Route = createFileRoute('/read/$bookId')({
  component: ReaderPage,
})

function ReaderPage() {
  const { bookId } = useParams({ from: '/read/$bookId' })
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nightMode, setNightMode] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [bookmarks, setBookmarks] = useState<{ position: number; note: string }[]>([])
  const [showBookmarkInput, setShowBookmarkInput] = useState(false)
  const [bookmarkNote, setBookmarkNote] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const deviceId = useRef(typeof window !== 'undefined' ? (localStorage.getItem('boipoka-device-id') || (() => { const id = crypto.randomUUID(); localStorage.setItem('boipoka-device-id', id); return id; })()) : 'server')

  // Disable right-click, Ctrl+P, Ctrl+S
  useEffect(() => {
    const preventActions = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        return false
      }
    }
    const preventContext = (e: MouseEvent) => { e.preventDefault(); return false; }
    const preventPrint = (e: Event) => { e.preventDefault(); }

    document.addEventListener('keydown', preventActions)
    document.addEventListener('contextmenu', preventContext)
    window.addEventListener('beforeprint', preventPrint)

    return () => {
      document.removeEventListener('keydown', preventActions)
      document.removeEventListener('contextmenu', preventContext)
      window.removeEventListener('beforeprint', preventPrint)
    }
  }, [])

  // Load book data
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/books/detail?id=${bookId}`).then(r => r.json()),
      fetch(`/api/book-content?bookId=${bookId}&deviceId=${deviceId.current}`).then(r => {
        if (!r.ok) throw new Error(r.status === 403 ? 'not-purchased' : r.status === 429 ? 'device-limit' : 'error')
        return r.json()
      }),
      fetch(`/api/reading-progress?bookId=${bookId}`).then(r => r.json()),
    ]).then(([bookData, contentData, progress]) => {
      setBook(bookData)
      setContent(contentData.content || bookData.previewPages?.join('\n\n---\n\n') || '')
      if (progress?.lastPosition && contentRef.current) {
        setTimeout(() => {
          window.scrollTo(0, progress.lastPosition)
        }, 100)
      }
      setLoading(false)
    }).catch((err) => {
      if (err.message === 'not-purchased') setError('not-purchased')
      else if (err.message === 'device-limit') setError('device-limit')
      else setError('error')
      setLoading(false)
    })
  }, [bookId, isAuthenticated])

  // Auto-save progress
  useEffect(() => {
    if (!isAuthenticated || !content) return
    const interval = setInterval(() => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      fetch('/api/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, progress, lastPosition: scrollTop }),
      }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [bookId, isAuthenticated, content])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const addBookmark = () => {
    const position = window.scrollY
    setBookmarks(prev => [...prev, { position, note: bookmarkNote }])
    setBookmarkNote('')
    setShowBookmarkInput(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">বই পড়তে লগইন করুন</h2>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-medium">
            Google দিয়ে লগইন করুন
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 bengali-text">বই লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (error === 'not-purchased') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-xl font-bold mb-2 bengali-text">এই বইটি আপনার কেনা নেই</h2>
          <p className="text-gray-500 mb-6 bengali-text">পুরো বই পড়তে এটি কিনুন</p>
          <Link to="/book/$bookId" params={{ bookId }} className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-medium inline-block bengali-text">
            বইটি কিনুন
          </Link>
        </div>
      </div>
    )
  }

  if (error === 'device-limit') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-6xl mb-4">📱</p>
          <h2 className="text-xl font-bold mb-2 bengali-text">ডিভাইস সীমা অতিক্রম</h2>
          <p className="text-gray-500 mb-6 bengali-text">একসাথে সর্বোচ্চ ২টি ডিভাইসে পড়া যাবে</p>
          <Link to="/" className="text-[#1877F2] hover:underline bengali-text">হোমে ফিরে যান</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors ${nightMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-900'}`}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div className="h-full bg-[#1877F2] transition-all" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Toolbar */}
      <div className={`sticky top-0 z-40 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/book/$bookId" params={{ bookId }} className="flex items-center gap-2 text-[#1877F2]">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline bengali-text">বিবরণে ফিরুন</span>
          </Link>

          <h2 className="text-sm font-medium truncate max-w-[200px] bengali-text">{book?.titleBn}</h2>

          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(32, f + 2))} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setNightMode(!nightMode)} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {nightMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowBookmarkInput(!showBookmarkInput)} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showBookmarkInput && (
          <div className={`max-w-3xl mx-auto px-4 pb-3 flex gap-2`}>
            <input
              type="text"
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="বুকমার্ক নোট..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={addBookmark} className="bg-[#1877F2] text-white px-4 py-2 rounded-lg text-sm bengali-text">
              সেভ
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 relative" ref={contentRef}>
        {/* Invisible watermark */}
        <div className="pointer-events-none fixed inset-0 z-30 opacity-[0.02] flex items-center justify-center rotate-[-30deg]"
          style={{ fontSize: '2rem', letterSpacing: '0.5em', color: nightMode ? '#fff' : '#000' }}>
          <div className="text-center no-select">
            {user?.email}<br/>{user?.email}<br/>{user?.email}<br/>{user?.email}<br/>{user?.email}
          </div>
        </div>

        <article
          className="bengali-text no-select leading-relaxed whitespace-pre-line"
          style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
        >
          {content}
        </article>

        {/* Bottom progress */}
        <div className="text-center py-8">
          <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'} bengali-text`}>
            পড়া সম্পন্ন: {scrollProgress}%
          </p>
        </div>
      </div>

      {/* Bookmarks sidebar */}
      {bookmarks.length > 0 && (
        <div className={`fixed bottom-4 right-4 ${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 max-w-xs z-40 border`}>
          <h4 className="font-medium text-sm mb-2 bengali-text">🔖 বুকমার্ক ({bookmarks.length})</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {bookmarks.map((bm, i) => (
              <button
                key={i}
                onClick={() => window.scrollTo({ top: bm.position, behavior: 'smooth' })}
                className="block w-full text-left text-xs p-2 hover:bg-gray-100 rounded"
              >
                {bm.note || `বুকমার্ক ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
