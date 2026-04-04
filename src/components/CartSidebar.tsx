import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { appStore, removeFromCart, clearCart, toggleCart, loadCartFromStorage } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import type { Book } from '@/lib/types'

export function CartSidebar() {
  const isOpen = useStore(appStore, (s) => s.isCartOpen)
  const cart = useStore(appStore, (s) => s.cart)
  const [books, setBooks] = useState<Record<string, Book>>({})
  const { isAuthenticated, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadCartFromStorage()
  }, [])

  useEffect(() => {
    if (cart.length > 0) {
      Promise.all(
        cart.map(async (item) => {
          if (!books[item.bookId]) {
            const res = await fetch(`/api/books/detail?id=${item.bookId}`)
            if (res.ok) return { id: item.bookId, book: await res.json() }
          }
          return null
        })
      ).then((results) => {
        const newBooks = { ...books }
        results.forEach((r) => { if (r) newBooks[r.id] = r.book })
        setBooks(newBooks)
      })
    }
  }, [cart])

  const total = cart.reduce((sum, item) => sum + (books[item.bookId]?.price || 0), 0)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-[#1877F2] text-white">
          <h2 className="font-bold text-lg bengali-text flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> কার্ট ({cart.length})
          </h2>
          <button onClick={toggleCart} className="hover:bg-blue-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 bengali-text">আপনার কার্ট খালি</p>
              <p className="text-gray-400 text-sm mt-1">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const book = books[item.bookId]
                return (
                  <div key={item.bookId} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center text-2xl shrink-0">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 bengali-text">{book?.titleBn || book?.title || 'Loading...'}</h4>
                      <p className="text-xs text-gray-500 mt-1 bengali-text">{book?.authorBn || book?.author}</p>
                      <p className="text-[#1877F2] font-bold mt-1">৳{book?.price || 0}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.bookId)} className="text-red-400 hover:text-red-600 p-1 self-start">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between mb-3">
              <span className="font-medium bengali-text">মোট:</span>
              <span className="font-bold text-lg text-[#1877F2]">৳{total}</span>
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => { toggleCart(); navigate({ to: '/checkout' }); }}
                className="w-full bg-[#FF6B35] hover:bg-orange-600 text-white py-3 rounded-lg font-medium bengali-text transition-colors"
              >
                চেকআউট করুন
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="w-full bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-lg font-medium bengali-text transition-colors"
              >
                অর্ডার করতে লগইন করুন
              </button>
            )}
            <button onClick={clearCart} className="w-full mt-2 text-red-500 hover:text-red-700 text-sm py-2 bengali-text">
              কার্ট খালি করুন
            </button>
          </div>
        )}
      </div>
    </>
  )
}
