import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@tanstack/react-store'
import { appStore, toggleCart, setSearchQuery } from '@/lib/store'
import { CATEGORIES } from '@/lib/types'
import { Search, ShoppingCart, Heart, User, Menu, X, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

export function Header() {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'reset-otp' | 'new-password'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [pendingSignup, setPendingSignup] = useState<{name: string, email: string, password: string} | null>(null)
  const [resetEmail, setResetEmail] = useState('')
  const cart = useStore(appStore, (s) => s.cart)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    navigate({ to: '/books', search: { q: searchInput } })
    setMobileMenuOpen(false)
  }

  const resetAuth = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setName('')
    setOtp('')
    setAuthError('')
    setShowPassword(false)
    setPendingSignup(null)
    setResetEmail('')
    setAuthMode('login')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const success = await loginWithEmail(email, password)
      if (success) { setShowAuthModal(false); resetAuth() }
      else setAuthError('ভুল ইমেইল বা পাসওয়ার্ড!')
    } catch {
      setAuthError('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (password !== confirmPassword) { setAuthError('পাসওয়ার্ড মিলছে না!'); return }
    if (password.length < 6) { setAuthError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!'); return }
    if (!name.trim()) { setAuthError('নাম দিন!'); return }
    setAuthLoading(true)
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' }),
      })
      const data = await res.json()
      if (res.ok) {
        setPendingSignup({ name, email, password })
        setAuthMode('otp')
        setAuthError('')
      } else {
        setAuthError(data.message || 'OTP পাঠাতে সমস্যা হয়েছে।')
      }
    } catch {
      setAuthError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!otp.trim() || otp.length !== 6) { setAuthError('৬ সংখ্যার OTP দিন!'); return }
    if (!pendingSignup) return
    setAuthLoading(true)
    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingSignup.email, otp }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.success) { setAuthError(verifyData.message || 'ভুল OTP!'); setAuthLoading(false); return }
      const success = await signupWithEmail(pendingSignup.name, pendingSignup.email, pendingSignup.password)
      if (success) { setShowAuthModal(false); resetAuth(); alert('✅ অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম!') }
      else setAuthError('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।')
    } catch {
      setAuthError('সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset' }),
      })
      const data = await res.json()
      if (res.ok) {
        setResetEmail(email)
        setOtp('')
        setAuthMode('reset-otp')
        setAuthError('')
      } else {
        setAuthError(data.message || 'OTP পাঠাতে সমস্যা হয়েছে।')
      }
    } catch {
      setAuthError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!otp.trim() || otp.length !== 6) { setAuthError('৬ সংখ্যার OTP দিন!'); return }
    setAuthLoading(true)
    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp, type: 'reset' }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.success) { setAuthError(verifyData.message || 'ভুল OTP!'); setAuthLoading(false); return }
      setAuthMode('new-password')
      setOtp('')
      setAuthError('')
    } catch {
      setAuthError('সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (newPassword.length < 6) { setAuthError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!'); return }
    if (newPassword !== confirmNewPassword) { setAuthError('পাসওয়ার্ড মিলছে না!'); return }
    setAuthLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('✅ পাসওয়ার্ড পরিবর্তন হয়েছে! এখন লগইন করুন।')
        resetAuth()
        setAuthMode('login')
      } else {
        setAuthError(data.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।')
      }
    } catch {
      setAuthError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।')
    } finally { setAuthLoading(false) }
  }

  const resendOtp = async (type: 'signup' | 'reset') => {
    const targetEmail = type === 'reset' ? resetEmail : pendingSignup?.email || ''
    if (!targetEmail) return
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, type }),
      })
      if (res.ok) alert('✅ নতুন OTP পাঠানো হয়েছে!')
      else setAuthError('OTP পাঠাতে সমস্যা হয়েছে।')
    } catch {
      setAuthError('নেটওয়ার্ক সমস্যা।')
    } finally { setAuthLoading(false) }
  }

  const handleGoogleLogin = () => { setShowAuthModal(false); loginWithGoogle() }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="bg-[#1877F2]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#1877F2] font-bold text-xl">📚</span>
              </div>
              <div className="text-white">
                <h1 className="text-xl font-bold leading-tight bengali-text">TranslatedBook</h1>
                <p className="text-xs text-blue-100 hidden sm:block">Bengali eBook Store</p>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="flex w-full">
                <input type="text" placeholder="বই বা লেখকের নাম খুঁজুন... / Search books..."
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-l-lg border-0 focus:outline-none text-gray-800" />
                <button type="submit" className="bg-[#FF6B35] hover:bg-orange-600 text-white px-5 py-2.5 rounded-r-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <Link to="/wishlist" className="text-white hover:text-blue-100 relative p-2">
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
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" /> : <User className="w-5 h-5" />}
                    <span className="text-sm hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
                  </Link>
                </div>
              ) : (
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  className="hidden sm:flex items-center gap-2 bg-white text-[#1877F2] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors bengali-text">
                  <User className="w-4 h-4" /> লগইন / সাইন আপ
                </button>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <nav className="hidden md:block bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              <Link to="/books" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-[#1877F2] hover:bg-blue-50 rounded-full whitespace-nowrap transition-colors bengali-text">সব বই</Link>
              {CATEGORIES.map((cat) => (
                <Link key={cat.id} to="/books" search={{ category: cat.id }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-full whitespace-nowrap transition-colors bengali-text">
                  <span className="mr-1">{cat.icon}</span>{cat.nameBn}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b shadow-lg">
            <div className="p-4">
              <form onSubmit={handleSearch} className="flex mb-4">
                <input type="text" placeholder="বই খুঁজুন..." value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border rounded-l-lg focus:outline-none" />
                <button type="submit" className="bg-[#1877F2] text-white px-4 rounded-r-lg"><Search className="w-5 h-5" /></button>
              </form>
              <div className="space-y-1">
                <Link to="/books" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">📖 সব বই</Link>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.id} to="/books" search={{ category: cat.id }} onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-blue-50 rounded-lg bengali-text">
                    {cat.icon} {cat.nameBn}
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">♡ উইশলিস্ট</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">👤 আমার অ্যাকাউন্ট</Link>
                    <Link to="/library" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg bengali-text">📚 আমার লাইব্রেরি</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg bengali-text">🚪 লগআউট</button>
                  </>
                ) : (
                  <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); setMobileMenuOpen(false) }}
                    className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-lg bengali-text">
                    লগইন / সাইন আপ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
            <div className="bg-[#1877F2] p-6 text-white text-center relative">
              <button onClick={() => { setShowAuthModal(false); resetAuth() }}
                className="absolute right-4 top-4 hover:bg-blue-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📚</span>
              </div>
              <h2 className="text-xl font-bold bengali-text">TranslatedBook</h2>
              <p className="text-blue-100 text-sm bengali-text">বাংলা ইবুক স্টোর</p>
            </div>

            {/* OTP Verify (Signup) */}
            {authMode === 'otp' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-8 h-8 text-[#1877F2]" />
                  </div>
                  <h3 className="font-bold text-lg bengali-text">OTP যাচাই করুন</h3>
                  <p className="text-gray-500 text-sm mt-1 bengali-text">
                    <span className="font-medium text-gray-700">{pendingSignup?.email}</span> এ OTP পাঠানো হয়েছে
                  </p>
                </div>
                {authError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm bengali-text mb-4">❌ {authError}</div>}
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" maxLength={6}
                    className="w-full text-center text-3xl font-bold tracking-widest border-2 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-[#1877F2]" required />
                  <button type="submit" disabled={authLoading || otp.length !== 6}
                    className="w-full bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                    {authLoading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন ও অ্যাকাউন্ট খুলুন'}
                  </button>
                </form>
                <div className="mt-4 text-center space-y-2">
                  <button onClick={() => resendOtp('signup')} disabled={authLoading}
                    className="text-sm text-[#1877F2] hover:underline bengali-text disabled:opacity-50">
                    OTP পাননি? আবার পাঠান
                  </button>
                  <br />
                  <button onClick={() => { setAuthMode('signup'); setAuthError(''); setOtp('') }}
                    className="text-sm text-gray-500 hover:underline bengali-text">← পিছনে যান</button>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            {authMode === 'forgot' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-lg bengali-text">পাসওয়ার্ড রিসেট</h3>
                  <p className="text-gray-500 text-sm mt-1 bengali-text">আপনার email এ OTP পাঠানো হবে</p>
                </div>
                {authError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm bengali-text mb-4">❌ {authError}</div>}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="আপনার ইমেইল"
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                  </div>
                  <button type="submit" disabled={authLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                    {authLoading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button onClick={() => { setAuthMode('login'); setAuthError('') }}
                    className="text-sm text-gray-500 hover:underline bengali-text">← লগইনে ফিরুন</button>
                </div>
              </div>
            )}

            {/* Reset OTP Verify */}
            {authMode === 'reset-otp' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-lg bengali-text">OTP যাচাই করুন</h3>
                  <p className="text-gray-500 text-sm mt-1 bengali-text">
                    <span className="font-medium text-gray-700">{resetEmail}</span> এ OTP পাঠানো হয়েছে
                  </p>
                </div>
                {authError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm bengali-text mb-4">❌ {authError}</div>}
                <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" maxLength={6}
                    className="w-full text-center text-3xl font-bold tracking-widest border-2 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500" required />
                  <button type="submit" disabled={authLoading || otp.length !== 6}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                    {authLoading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
                  </button>
                </form>
                <div className="mt-4 text-center space-y-2">
                  <button onClick={() => resendOtp('reset')} disabled={authLoading}
                    className="text-sm text-orange-500 hover:underline bengali-text disabled:opacity-50">
                    OTP পাননি? আবার পাঠান
                  </button>
                  <br />
                  <button onClick={() => { setAuthMode('forgot'); setAuthError(''); setOtp('') }}
                    className="text-sm text-gray-500 hover:underline bengali-text">← পিছনে যান</button>
                </div>
              </div>
            )}

            {/* New Password */}
            {authMode === 'new-password' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg bengali-text">নতুন পাসওয়ার্ড দিন</h3>
                </div>
                {authError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm bengali-text mb-4">❌ {authError}</div>}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                      className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" required />
                  </div>
                  <button type="submit" disabled={authLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                    {authLoading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                  </button>
                </form>
              </div>
            )}

            {/* Login & Signup */}
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="flex border-b">
                  <button onClick={() => { setAuthMode('login'); setAuthError('') }}
                    className={`flex-1 py-3 text-sm font-medium bengali-text transition-colors ${authMode === 'login' ? 'text-[#1877F2] border-b-2 border-[#1877F2]' : 'text-gray-500 hover:text-gray-700'}`}>
                    লগইন
                  </button>
                  <button onClick={() => { setAuthMode('signup'); setAuthError('') }}
                    className={`flex-1 py-3 text-sm font-medium bengali-text transition-colors ${authMode === 'signup' ? 'text-[#1877F2] border-b-2 border-[#1877F2]' : 'text-gray-500 hover:text-gray-700'}`}>
                    নতুন অ্যাকাউন্ট
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {authError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm bengali-text">❌ {authError}</div>}

                  {authMode === 'login' ? (
                    <form onSubmit={handleEmailLogin} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">ইমেইল</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="আপনার ইমেইল"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">পাসওয়ার্ড</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="আপনার পাসওয়ার্ড"
                            className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {/* পাসওয়ার্ড ভুলে গেছেন */}
                      <div className="text-right">
                        <button type="button" onClick={() => { setAuthMode('forgot'); setAuthError(''); setEmail('') }}
                          className="text-sm text-[#1877F2] hover:underline bengali-text">
                          পাসওয়ার্ড ভুলে গেছেন?
                        </button>
                      </div>
                      <button type="submit" disabled={authLoading}
                        className="w-full bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                        {authLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignupRequest} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">আপনার নাম</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="আপনার পুরো নাম"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bengali-text" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">ইমেইল</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="আপনার ইমেইল"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">পাসওয়ার্ড</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="কমপক্ষে ৬ অক্ষর"
                            className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">পাসওয়ার্ড নিশ্চিত করুন</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="পাসওয়ার্ড আবার লিখুন"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                        </div>
                      </div>
                      <button type="submit" disabled={authLoading}
                        className="w-full bg-[#1877F2] hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 bengali-text">
                        {authLoading ? 'OTP পাঠানো হচ্ছে...' : 'OTP পাঠান'}
                      </button>
                    </form>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400 bengali-text">অথবা</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 py-3 rounded-lg font-medium transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="bengali-text">Google দিয়ে লগইন করুন</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}