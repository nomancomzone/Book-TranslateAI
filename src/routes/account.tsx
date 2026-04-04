import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BookOpen, ShoppingBag, Heart, Clock, LogOut, User, CreditCard } from 'lucide-react'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    fetch('/api/user-data').then(r => r.json()).then(data => {
      setUserData(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 bengali-text">আমার অ্যাকাউন্ট</h2>
          <button onClick={loginWithGoogle} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg">Google দিয়ে লগইন করুন</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: User },
    { id: 'orders', label: 'অর্ডার', icon: ShoppingBag },
    { id: 'history', label: 'পড়ার ইতিহাস', icon: Clock },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#1877F2] to-[#1565C0] rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-white" />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-blue-100">{user?.email}</p>
          </div>
          <button onClick={logout} className="ml-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{userData?.purchasedBooks?.length || 0}</p>
            <p className="text-sm text-blue-100 bengali-text">কেনা বই</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{userData?.orders?.length || 0}</p>
            <p className="text-sm text-blue-100 bengali-text">অর্ডার</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{userData?.wishlist?.length || 0}</p>
            <p className="text-sm text-blue-100 bengali-text">উইশলিস্ট</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link to="/library" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <BookOpen className="w-8 h-8 text-[#1877F2]" />
          <span className="text-sm font-medium bengali-text">আমার লাইব্রেরি</span>
        </Link>
        <Link to="/wishlist" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <Heart className="w-8 h-8 text-red-500" />
          <span className="text-sm font-medium bengali-text">উইশলিস্ট</span>
        </Link>
        <Link to="/books" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <ShoppingBag className="w-8 h-8 text-green-500" />
          <span className="text-sm font-medium bengali-text">বই কিনুন</span>
        </Link>
        <Link to="/checkout" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <CreditCard className="w-8 h-8 text-orange-500" />
          <span className="text-sm font-medium bengali-text">পেমেন্ট</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-[#1877F2] text-white' : 'bg-white border hover:bg-gray-50'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="bengali-text">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4 bengali-text">অ্যাকাউন্ট তথ্য</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500 bengali-text">নাম</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500 bengali-text">ইমেইল</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500 bengali-text">সদস্য হয়েছেন</span>
              <span className="font-medium">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('bn-BD') : '-'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 bengali-text">লগইন পদ্ধতি</span>
              <span className="font-medium">Google</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4 bengali-text">অর্ডার ইতিহাস</h3>
          {!userData?.orders?.length ? (
            <p className="text-gray-500 text-center py-8 bengali-text">এখনো কোনো অর্ডার নেই</p>
          ) : (
            <div className="space-y-3">
              {userData.orders.map((orderId: string) => (
                <div key={orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{orderId}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full bengali-text">সম্পন্ন</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4 bengali-text">পড়ার ইতিহাস</h3>
          {!userData?.readingProgress || Object.keys(userData.readingProgress).length === 0 ? (
            <p className="text-gray-500 text-center py-8 bengali-text">এখনো কোনো বই পড়া হয়নি</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(userData.readingProgress).map(([bookId, prog]: [string, any]) => (
                <Link key={bookId} to="/read/$bookId" params={{ bookId }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-sm">Book: {bookId}</p>
                    <p className="text-xs text-gray-500">{prog.lastRead ? new Date(prog.lastRead).toLocaleDateString('bn-BD') : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1877F2]">{prog.progress || 0}%</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
