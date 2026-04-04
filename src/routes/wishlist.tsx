import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Heart, Plus, Trash2, Send } from 'lucide-react'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
})

function WishlistPage() {
  const { isAuthenticated, loginWithGoogle } = useAuth()
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookName, setBookName] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    fetch('/api/wishlist').then(r => r.json()).then(data => {
      setWishlist(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isAuthenticated])

  const addWish = async () => {
    if (!bookName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookName, authorName, note: reason }),
      })
      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
        setBookName('')
        setAuthorName('')
        setReason('')
      }
    } catch {} finally { setSubmitting(false) }
  }

  const removeWish = async (id: string) => {
    const res = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setWishlist(await res.json())
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">উইশলিস্ট</h2>
          <p className="text-gray-500 mb-6 bengali-text">আপনি কোন বই বাংলায় অনুবাদ করে চান তা জানান</p>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg">Google দিয়ে লগইন করুন</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 bengali-text">উইশলিস্ট</h1>
      <p className="text-gray-500 mb-6 bengali-text">কোন বই বাংলায় অনুবাদ হোক চান? বইয়ের নাম, লেখক ও কারণ জানান!</p>

      {/* Add form */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h3 className="font-bold mb-4 bengali-text flex items-center gap-2"><Plus className="w-5 h-5" /> বই অনুবাদের অনুরোধ</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="বইয়ের নাম *"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bengali-text"
          />
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="লেখকের নাম"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bengali-text"
          />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="বাংলায় কেন চান তার কারণ লিখুন *"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bengali-text"
            rows={3}
          />
          <button
            onClick={addWish}
            disabled={submitting || !bookName.trim() || !reason.trim()}
            className="flex items-center gap-2 bg-[#1877F2] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors bengali-text"
          >
            <Send className="w-4 h-4" /> {submitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
          </button>
        </div>
      </div>

      {/* Wishlist items */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 bengali-text">আপনার উইশলিস্ট খালি</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlist.map(item => (
            <div key={item.id} className="bg-white rounded-xl border p-4 flex items-start justify-between">
              <div>
                <h4 className="font-medium bengali-text">{item.bookName}</h4>
                {item.authorName && <p className="text-sm text-gray-500 bengali-text">{item.authorName}</p>}
                {item.note && <p className="text-sm text-gray-500 mt-1 bengali-text"><span className="text-gray-400">কারণ:</span> {item.note}</p>}
                <p className="text-xs text-gray-300 mt-1">{new Date(item.createdAt).toLocaleDateString('bn-BD')}</p>
              </div>
              <button onClick={() => removeWish(item.id)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
