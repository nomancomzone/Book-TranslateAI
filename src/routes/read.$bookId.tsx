import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sun, Moon, ArrowLeft, BookOpen } from 'lucide-react'
import type { Book } from '@/lib/types'

export const Route = createFileRoute('/read/$bookId')({
  component: ReaderPage,
})

function ReaderPage() {
  const { bookId } = useParams({ from: '/read/$bookId' })
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasPdf, setHasPdf] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [notOwned, setNotOwned] = useState(false)

  // Disable right-click, Ctrl+P, Ctrl+S
  useEffect(() => {
    const preventActions = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['p','P','s','S'].includes(e.key)) {
        e.preventDefault()
      }
    }
    const preventContext = (e: MouseEvent) => { e.preventDefault() }
    document.addEventListener('keydown', preventActions)
    document.addEventListener('contextmenu', preventContext)
    return () => {
      document.removeEventListener('keydown', preventActions)
      document.removeEventListener('contextmenu', preventContext)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }

    // Book info লোড করো
    fetch(`/api/books/detail?id=${bookId}`)
      .then(r => r.json())
      .then(async (bookData) => {
        setBook(bookData)

        // User এর library check করো
        const userData = await fetch('/api/user-data').then(r => r.json()).catch(() => ({}))
        const owned = userData?.purchasedBooks?.includes(bookId)

        if (!owned) {
          setNotOwned(true)
          setLoading(false)
          return
        }

        // PDF আছে কিনা check করো
        const pdfCheck = await fetch(`/api/pdf?bookId=${bookId}`, { method: 'HEAD' }).catch(() => null)
        setHasPdf(pdfCheck?.ok || false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookId, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">বই পড়তে লগইন করুন</h2>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-medium bengali-text">
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

  if (notOwned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-xl font-bold mb-2 bengali-text">এই বইটি আপনার কেনা নেই</h2>
          <p className="text-gray-500 mb-6 bengali-text">পুরো বই পড়তে এটি কিনুন</p>
          <Link to="/book/$bookId" params={{ bookId }}
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-medium inline-block bengali-text">
            বইটি কিনুন
          </Link>
        </div>
      </div>
    )
  }

  if (!hasPdf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <p className="text-6xl mb-4">📄</p>
          <h2 className="text-xl font-bold mb-2 bengali-text">PDF এখনো আপলোড হয়নি</h2>
          <p className="text-gray-500 mb-6 bengali-text">Admin এ গিয়ে বইটির PDF আপলোড করুন</p>
          <Link to="/" className="text-[#1877F2] hover:underline bengali-text">হোমে ফিরুন</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${nightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Toolbar */}
      <div className={`sticky top-0 z-40 ${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/book/$bookId" params={{ bookId }} className="flex items-center gap-2 text-[#1877F2]">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline bengali-text">বিবরণে ফিরুন</span>
          </Link>

          <h2 className="text-sm font-medium truncate max-w-[200px] bengali-text">{book?.titleBn}</h2>

          <button onClick={() => setNightMode(!nightMode)}
            className={`p-2 rounded-lg ${nightMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100'}`}>
            {nightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Invisible watermark */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-[0.03] flex items-center justify-center rotate-[-30deg] select-none">
        <div className="text-center text-2xl" style={{ letterSpacing: '0.5em', color: nightMode ? '#fff' : '#000' }}>
          {user?.email}<br/>{user?.email}<br/>{user?.email}
        </div>
      </div>

      {/* PDF Viewer */}
     <div className="flex-1 w-full" style={{ height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
        <iframe
          src={`/api/pdf?bookId=${bookId}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full"
        style={{ height: 'calc(100vh - 52px)', border: 'none', width: '100%', display: 'block' }}
          title={book?.titleBn || 'Book Reader'}
        />
      </div>
    </div>
  )
}