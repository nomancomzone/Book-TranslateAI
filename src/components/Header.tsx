import { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@tanstack/react-store'
import { appStore, toggleCart, setSearchQuery } from '@/lib/store'
import { CATEGORIES } from '@/lib/types'
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react'

export function Header() {
  const { user, loginWithGoogle, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const cart = useStore(appStore, (s) => s.cart)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    navigate({ to: '/books', search: { q: searchInput } })
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Main Header */}
      <div className="bg-[#1877F2]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1877F2] font-bold text-xl">📚</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold leading-tight bengali-text">TranslatedBook</h1>
              <p className="text-xs text-blue-100 hidden sm:block">Bengali eBook Store</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="বই বা লেখকের নাম খুঁজুন... / Search books..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
              />
              <button type="submit" className="bg-[#FF6B35] hover:bg-orange-600 text-white px-5 py-2.5 rounded-r-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link to="/wishlist" className="text-white hover:text-blue-100 relative p-2" title="উইশলিস্ট">
              <Heart className="w-5 h-5" />
            </Link>
            <button onClick={toggleCart} className="text-white hover:text-blue-100 relative p-2">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/account" className="flex items-center gap-2 text-white hover:text-blue-100 p-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
                </Link>
              </div>
            ) : (
              <button onClick={loginWithGoogle} className="hidden sm:flex items-center gap-2 bg-white text-[#1877F2] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google Login
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation - Desktop */}
      <nav className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link to="/books" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-[#1877F2] hover:bg-blue-50 rounded-full whitespace-nowrap transition-colors">
              সব বই
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to="/books"
                search={{ category: cat.id }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-full whitespace-nowrap transition-colors"
              >
                <span className="mr-1">{cat.icon}</span>{cat.nameBn}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex mb-4">
              <input
                type="text"
                placeholder="বই খুঁজুন..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button type="submit" className="bg-[#1877F2] text-white px-4 rounded-r-lg">
                <Search className="w-5 h-5" />
              </button>
            </form>
            <div className="space-y-1">
              <Link to="/books" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">
                📖 সব বই
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to="/books"
                  search={{ category: cat.id }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-gray-600 hover:bg-blue-50 rounded-lg bengali-text"
                >
                  {cat.icon} {cat.nameBn}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">
                ♡ উইশলিস্ট
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg">
                    👤 আমার অ্যাকাউন্ট
                  </Link>
                  <Link to="/library" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg">
                    📚 আমার লাইব্রেরি
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg">
                    🚪 লগআউট
                  </button>
                </>
              ) : (
                <button onClick={loginWithGoogle} className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-lg">
                  Google দিয়ে লগইন করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
