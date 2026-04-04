import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { appStore, clearCart } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { CreditCard, ShoppingBag, Lock } from 'lucide-react'
import type { Book } from '@/lib/types'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const cart = useStore(appStore, (s) => s.cart)
  const [books, setBooks] = useState<Record<string, Book>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (cart.length === 0) { setLoading(false); return }
    Promise.all(
      cart.map(async (item) => {
        const res = await fetch(`/api/books/detail?id=${item.bookId}`)
        if (res.ok) return { id: item.bookId, book: await res.json() }
        return null
      })
    ).then(results => {
      const booksMap: Record<string, Book> = {}
      results.forEach(r => { if (r) booksMap[r.id] = r.book })
      setBooks(booksMap)
      setLoading(false)
    })
  }, [cart])

  const total = cart.reduce((sum, item) => sum + (books[item.bookId]?.price || 0), 0)

  const handlePayment = async () => {
    if (!isAuthenticated) { loginWithGoogle(); return }
    setProcessing(true)
    try {
      const items = cart.map(item => ({
        bookId: item.bookId,
        title: books[item.bookId]?.title || '',
        price: books[item.bookId]?.price || 0,
      }))
      const res = await fetch('/api/payment-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalAmount: total }),
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।')
      }
    } catch {
      alert('সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally { setProcessing(false) }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">চেকআউট</h2>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg">Google দিয়ে লগইন করুন</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 bengali-text">চেকআউট</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 bengali-text">কার্ট খালি</h3>
          <Link to="/books" className="text-[#1877F2] hover:underline bengali-text">বই কিনতে যান</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4 bengali-text">অর্ডার সামারি</h3>
            <div className="space-y-3">
              {cart.map(item => {
                const book = books[item.bookId]
                return (
                  <div key={item.bookId} className="flex items-center gap-4 pb-3 border-b last:border-0">
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded flex items-center justify-center">📖</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm bengali-text">{book?.titleBn || 'Loading...'}</p>
                      <p className="text-xs text-gray-500 bengali-text">{book?.authorBn}</p>
                    </div>
                    <span className="font-bold text-[#1877F2]">৳{book?.price || 0}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span className="font-bold bengali-text">মোট</span>
              <span className="font-bold text-xl text-[#1877F2]">৳{total}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4 bengali-text">পেমেন্ট পদ্ধতি</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="border-2 border-[#1877F2] rounded-lg p-3 text-center">
                <p className="font-bold text-pink-600">bKash</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="font-bold text-orange-600">Nagad</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="font-bold text-blue-800">Visa</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="font-bold text-red-600">Mastercard</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1 bengali-text">
              <Lock className="w-3 h-3" /> SSLCommerz দ্বারা সুরক্ষিত পেমেন্ট
            </p>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-[#FF6B35] hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 bengali-text"
            >
              {processing ? 'প্রক্রিয়াকরণ হচ্ছে...' : `৳${total} পেমেন্ট করুন`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
