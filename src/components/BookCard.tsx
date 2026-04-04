import { Link } from '@tanstack/react-router'
import { Star, ShoppingCart } from 'lucide-react'
import { addToCart } from '@/lib/store'
import type { Book } from '@/lib/types'

export function BookCard({ book }: { book: Book }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
      <Link to="/book/$bookId" params={{ bookId: book.id }}>
        <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <span className="text-5xl mb-3">📖</span>
              <p className="text-center text-sm font-medium text-blue-800 bengali-text line-clamp-2">{book.titleBn}</p>
              <p className="text-center text-xs text-blue-600 mt-1 bengali-text">{book.authorBn}</p>
            </div>
          )}
          {book.originalPrice && book.originalPrice > book.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {Math.round((1 - book.price / book.originalPrice) * 100)}% ছাড়
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{book.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <Link to="/book/$bookId" params={{ bookId: book.id }}>
          <h3 className="font-semibold text-sm line-clamp-2 bengali-text hover:text-[#1877F2] transition-colors">{book.titleBn || book.title}</h3>
        </Link>
        <p className="text-xs text-gray-500 mt-1 bengali-text">{book.authorBn || book.author}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-[#1877F2]">৳{book.price}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-xs text-gray-400 line-through ml-2">৳{book.originalPrice}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(book.id); }}
            className="bg-[#1877F2] hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="কার্টে যোগ করুন"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
