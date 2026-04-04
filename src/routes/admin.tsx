import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { CATEGORIES, type Book } from '@/lib/types'
import { BookOpen, Users, DollarSign, BarChart3, Heart, MessageSquare, Plus, Edit, Trash2, Eye, EyeOff, Sparkles, LogIn, ShoppingBag } from 'lucide-react'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [books, setBooks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [wishlists, setWishlists] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Book form state
  const [editingBook, setEditingBook] = useState<any>(null)
  const [bookForm, setBookForm] = useState({
    title: '', titleBn: '', author: '', authorBn: '', price: 0, originalPrice: 0,
    category: 'novel', categoryBn: 'উপন্যাস', tags: '', tagsBn: '',
    mainMessage: '', mainMessageBn: '', summary: '', summaryBn: '',
    keyPoints: '', keyPointsBn: '', targetAudience: '', targetAudienceBn: '',
    readingTime: '', mood: 'informative' as const, moodBn: '',
    quotes: '', aboutAuthor: '', aboutAuthorBn: '', published: true,
  })
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  const res = await fetch('/api/admin?action=verify-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    body: JSON.stringify({ password }),
  })
  if (res.ok) {
    setAdminPassword(H%-%7ryud45@gu)
    setAuthenticated(true)
  } else {
    alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।')
  }
}

  const fetchData = async (action: string) => {
    const res = await fetch(`/api/admin?action=${action}`, { headers })
    if (res.status === 401) { setAuthenticated(false); return [] }
    return res.json()
  }

  useEffect(() => {
    if (!authenticated) return
    setLoading(true)
    Promise.all([
      fetchData('list-books').then(setBooks),
      fetchData('list-users').then(setUsers),
      fetchData('sales-report').then(setSalesData),
      fetchData('list-wishlists').then(setWishlists),
      fetchData('list-orders').then(setOrders),
    ]).finally(() => setLoading(false))
  }, [authenticated])

  const saveBook = async () => {
    const tags = bookForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    const tagsBn = bookForm.tagsBn.split(',').map(t => t.trim()).filter(Boolean)
    const keyPoints = bookForm.keyPoints.split('\n').filter(Boolean)
    const keyPointsBn = bookForm.keyPointsBn.split('\n').filter(Boolean)
    let quotes: any[] = []
    try { quotes = JSON.parse(bookForm.quotes || '[]') } catch { quotes = [] }

    const data = {
      ...bookForm, tags, tagsBn, keyPoints, keyPointsBn, quotes,
      price: Number(bookForm.price), originalPrice: Number(bookForm.originalPrice),
      previewPages: [], relatedBookIds: [], coverImage: '',
      ...(editingBook ? { id: editingBook.id } : {}),
    }

    const action = editingBook ? 'update-book' : 'create-book'
    const res = await fetch(`/api/admin?action=${action}`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const book = await res.json()
      if (bookContent) {
        await fetch(`/api/admin?action=upload-content`, {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: book.id, content: bookContent }),
        })
      }
      setBooks(await fetchData('list-books'))
      setEditingBook(null)
      resetForm()
      alert('বই সেভ হয়েছে!')
    }
  }

  const deleteBook = async (bookId: string) => {
    if (!confirm('এই বই মুছে ফেলতে চান?')) return
    await fetch(`/api/admin?action=delete-book`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    })
    setBooks(books.filter(b => b.id !== bookId))
  }

  const togglePublish = async (book: any) => {
    await fetch(`/api/admin?action=update-book`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...book, published: !book.published }),
    })
    setBooks(await fetchData('list-books'))
  }

  const generateWithAI = async () => {
    if (!bookForm.title || !bookForm.author) { alert('Title and author required'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookForm.title, author: bookForm.author, content: bookContent }),
      })
      if (res.ok) {
        const data = await res.json()
        setBookForm(prev => ({
          ...prev,
          titleBn: data.titleBn || prev.titleBn,
          authorBn: data.authorBn || prev.authorBn,
          summaryBn: data.summaryBn || prev.summaryBn,
          mainMessageBn: data.mainMessageBn || prev.mainMessageBn,
          keyPointsBn: (data.keyPointsBn || []).join('\n'),
          targetAudienceBn: data.targetAudienceBn || prev.targetAudienceBn,
          readingTime: data.readingTime || prev.readingTime,
          mood: data.mood || prev.mood,
          moodBn: data.moodBn || prev.moodBn,
          aboutAuthorBn: data.aboutAuthorBn || prev.aboutAuthorBn,
          tags: (data.tags || []).join(', '),
          tagsBn: (data.tagsBn || []).join(', '),
          category: data.category || prev.category,
          categoryBn: data.categoryBn || prev.categoryBn,
          quotes: JSON.stringify(data.quotes || [], null, 2),
        }))
        alert('AI দিয়ে তথ্য তৈরি হয়েছে!')
      } else {
        alert('AI generation failed')
      }
    } catch { alert('Error') } finally { setGenerating(false) }
  }

  const resetForm = () => {
    setBookForm({
      title: '', titleBn: '', author: '', authorBn: '', price: 0, originalPrice: 0,
      category: 'novel', categoryBn: 'উপন্যাস', tags: '', tagsBn: '',
      mainMessage: '', mainMessageBn: '', summary: '', summaryBn: '',
      keyPoints: '', keyPointsBn: '', targetAudience: '', targetAudienceBn: '',
      readingTime: '', mood: 'informative', moodBn: '', quotes: '',
      aboutAuthor: '', aboutAuthorBn: '', published: true,
    })
    setBookContent('')
    setEditingBook(null)
  }

  const startEdit = (book: any) => {
    setEditingBook(book)
    setBookForm({
      title: book.title || '', titleBn: book.titleBn || '',
      author: book.author || '', authorBn: book.authorBn || '',
      price: book.price || 0, originalPrice: book.originalPrice || 0,
      category: book.category || 'novel', categoryBn: book.categoryBn || '',
      tags: (book.tags || []).join(', '), tagsBn: (book.tagsBn || []).join(', '),
      mainMessage: book.mainMessage || '', mainMessageBn: book.mainMessageBn || '',
      summary: book.summary || '', summaryBn: book.summaryBn || '',
      keyPoints: (book.keyPoints || []).join('\n'), keyPointsBn: (book.keyPointsBn || []).join('\n'),
      targetAudience: book.targetAudience || '', targetAudienceBn: book.targetAudienceBn || '',
      readingTime: book.readingTime || '', mood: book.mood || 'informative', moodBn: book.moodBn || '',
      quotes: JSON.stringify(book.quotes || [], null, 2),
      aboutAuthor: book.aboutAuthor || '', aboutAuthorBn: book.aboutAuthorBn || '',
      published: book.published !== false,
    })
    setActiveTab('add-book')
  }

  const seedBooks = async () => {
    const res = await fetch('/api/seed-books', { method: 'POST', headers })
    if (res.ok) {
      const data = await res.json()
      alert(`${data.seeded} টি বই যোগ হয়েছে!`)
      setBooks(await fetchData('list-books'))
    }
  }

  const totalRevenue = salesData.reduce((sum: number, d: any) => sum + (d.totalRevenue || 0), 0)
  const totalSales = salesData.reduce((sum: number, d: any) => sum + (d.totalSales || 0), 0)

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1877F2] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold bengali-text">অ্যাডমিন প্যানেল</h1>
            <p className="text-gray-500 text-sm">Admin Panel Login</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="অ্যাডমিন পাসওয়ার্ড"
            className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <button type="submit" className="w-full bg-[#1877F2] text-white py-3 rounded-lg font-medium bengali-text">লগইন</button>
        </form>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: BarChart3 },
    { id: 'books', label: 'বই ম্যানেজ', icon: BookOpen },
    { id: 'add-book', label: editingBook ? 'বই সম্পাদনা' : 'নতুন বই', icon: Plus },
    { id: 'users', label: 'ব্যবহারকারী', icon: Users },
    { id: 'orders', label: 'অর্ডার', icon: ShoppingBag },
    { id: 'sales', label: 'বিক্রয় রিপোর্ট', icon: DollarSign },
    { id: 'wishlists', label: 'উইশলিস্ট', icon: Heart },
    { id: 'reviews', label: 'রিভিউ', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-[#1A1A2E] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold bengali-text">📚 TranslatedBook অ্যাডমিন</h1>
        <button onClick={() => setAuthenticated(false)} className="text-sm text-gray-400 hover:text-white">লগআউট</button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white min-h-screen border-r hidden md:block">
          <nav className="p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${activeTab === tab.id ? 'bg-[#1877F2] text-white' : 'hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="bengali-text">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t mt-4">
            <button onClick={seedBooks} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm bengali-text">
              📦 Sample বই যোগ করুন
            </button>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex overflow-x-auto">
          {tabs.slice(0, 5).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs ${activeTab === tab.id ? 'text-[#1877F2]' : 'text-gray-500'}`}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="bengali-text truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">ড্যাশবোর্ড</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border">
                      <BookOpen className="w-8 h-8 text-[#1877F2] mb-2" />
                      <p className="text-2xl font-bold">{books.length}</p>
                      <p className="text-sm text-gray-500 bengali-text">মোট বই</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <Users className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold">{users.length}</p>
                      <p className="text-sm text-gray-500 bengali-text">মোট ব্যবহারকারী</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <ShoppingBag className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">{totalSales}</p>
                      <p className="text-sm text-gray-500 bengali-text">মোট বিক্রয়</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <DollarSign className="w-8 h-8 text-purple-500 mb-2" />
                      <p className="text-2xl font-bold">৳{totalRevenue}</p>
                      <p className="text-sm text-gray-500 bengali-text">মোট আয়</p>
                    </div>
                  </div>

                  {/* Sales Chart (simplified) */}
                  <div className="bg-white rounded-xl border p-6">
                    <h3 className="font-bold mb-4 bengali-text">📊 দৈনিক বিক্রয়</h3>
                    {salesData.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 bengali-text">এখনো কোনো বিক্রয় তথ্য নেই</p>
                    ) : (
                      <div className="space-y-2">
                        {salesData.slice(0, 14).map((day: any) => (
                          <div key={day.date} className="flex items-center gap-3">
                            <span className="text-sm w-24 text-gray-500">{day.date}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-6">
                              <div
                                className="bg-[#1877F2] h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${Math.min(100, (day.totalRevenue / (Math.max(...salesData.map((d: any) => d.totalRevenue || 1)))) * 100)}%`, minWidth: '40px' }}
                              >
                                <span className="text-xs text-white font-medium">৳{day.totalRevenue}</span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 w-16 text-right">{day.totalSales} টি</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Books Management */}
              {activeTab === 'books' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bengali-text">📚 বই ম্যানেজমেন্ট</h2>
                    <button onClick={() => { resetForm(); setActiveTab('add-book'); }} className="bg-[#1877F2] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 bengali-text">
                      <Plus className="w-4 h-4" /> নতুন বই
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left bengali-text">বই</th>
                            <th className="px-4 py-3 text-left bengali-text">ক্যাটাগরি</th>
                            <th className="px-4 py-3 text-left bengali-text">মূল্য</th>
                            <th className="px-4 py-3 text-left bengali-text">পাঠক</th>
                            <th className="px-4 py-3 text-left bengali-text">রেটিং</th>
                            <th className="px-4 py-3 text-left bengali-text">স্ট্যাটাস</th>
                            <th className="px-4 py-3 text-left bengali-text">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {books.map(book => (
                            <tr key={book.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <p className="font-medium bengali-text">{book.titleBn || book.title}</p>
                                <p className="text-xs text-gray-500 bengali-text">{book.authorBn || book.author}</p>
                              </td>
                              <td className="px-4 py-3 bengali-text">{book.categoryBn}</td>
                              <td className="px-4 py-3">৳{book.price}</td>
                              <td className="px-4 py-3">{book.totalReaders || 0}</td>
                              <td className="px-4 py-3">{book.rating?.toFixed(1) || '0.0'} ⭐</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${book.published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {book.published ? 'প্রকাশিত' : 'ড্রাফট'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => startEdit(book)} className="p-1.5 hover:bg-blue-50 rounded text-[#1877F2]"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => togglePublish(book)} className="p-1.5 hover:bg-gray-100 rounded">{book.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                  <button onClick={() => deleteBook(book.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Book */}
              {activeTab === 'add-book' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold bengali-text">{editingBook ? '✏️ বই সম্পাদনা' : '📝 নতুন বই যোগ করুন'}</h2>
                    <button onClick={generateWithAI} disabled={generating} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                      <Sparkles className="w-4 h-4" /> {generating ? 'তৈরি হচ্ছে...' : 'AI দিয়ে তৈরি করুন'}
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title (English)</label>
                        <input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">শিরোনাম (বাংলা)</label>
                        <input type="text" value={bookForm.titleBn} onChange={e => setBookForm({...bookForm, titleBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Author (English)</label>
                        <input type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">লেখক (বাংলা)</label>
                        <input type="text" value={bookForm.authorBn} onChange={e => setBookForm({...bookForm, authorBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">মূল্য (৳)</label>
                        <input type="number" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">আসল মূল্য (৳)</label>
                        <input type="number" value={bookForm.originalPrice} onChange={e => setBookForm({...bookForm, originalPrice: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">ক্যাটাগরি</label>
                        <select value={bookForm.category} onChange={e => { const cat = CATEGORIES.find(c => c.id === e.target.value); setBookForm({...bookForm, category: e.target.value, categoryBn: cat?.nameBn || ''}); }} className="w-full border rounded-lg px-3 py-2">
                          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.nameBn} ({c.name})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">মুড</label>
                        <select value={bookForm.mood} onChange={e => setBookForm({...bookForm, mood: e.target.value as any})} className="w-full border rounded-lg px-3 py-2">
                          <option value="motivational">Motivational</option>
                          <option value="informative">Informative</option>
                          <option value="sad">Sad</option>
                          <option value="funny">Funny</option>
                          <option value="thriller">Thriller</option>
                          <option value="romantic">Romantic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">মুড (বাংলা)</label>
                        <input type="text" value={bookForm.moodBn} onChange={e => setBookForm({...bookForm, moodBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">পড়ার সময়</label>
                        <input type="text" value={bookForm.readingTime} onChange={e => setBookForm({...bookForm, readingTime: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" placeholder="৫ ঘণ্টা" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                      <input type="text" value={bookForm.tags} onChange={e => setBookForm({...bookForm, tags: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 bengali-text">ট্যাগ (কমা দিয়ে আলাদা)</label>
                      <input type="text" value={bookForm.tagsBn} onChange={e => setBookForm({...bookForm, tagsBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 bengali-text">মূল বার্তা (বাংলা)</label>
                      <input type="text" value={bookForm.mainMessageBn} onChange={e => setBookForm({...bookForm, mainMessageBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Summary (English)</label>
                        <textarea value={bookForm.summary} onChange={e => setBookForm({...bookForm, summary: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={4} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">সারসংক্ষেপ (বাংলা)</label>
                        <textarea value={bookForm.summaryBn} onChange={e => setBookForm({...bookForm, summaryBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" rows={4} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Key Points (one per line)</label>
                        <textarea value={bookForm.keyPoints} onChange={e => setBookForm({...bookForm, keyPoints: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={4} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">মূল বিষয় (প্রতি লাইনে একটি)</label>
                        <textarea value={bookForm.keyPointsBn} onChange={e => setBookForm({...bookForm, keyPointsBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" rows={4} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Target Audience</label>
                        <input type="text" value={bookForm.targetAudience} onChange={e => setBookForm({...bookForm, targetAudience: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">লক্ষ্য পাঠক (বাংলা)</label>
                        <input type="text" value={bookForm.targetAudienceBn} onChange={e => setBookForm({...bookForm, targetAudienceBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Quotes (JSON array)</label>
                      <textarea value={bookForm.quotes} onChange={e => setBookForm({...bookForm, quotes: e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" rows={4} placeholder='[{"text": "English", "textBn": "বাংলা"}]' />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">About Author</label>
                        <textarea value={bookForm.aboutAuthor} onChange={e => setBookForm({...bookForm, aboutAuthor: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 bengali-text">লেখক সম্পর্কে (বাংলা)</label>
                        <textarea value={bookForm.aboutAuthorBn} onChange={e => setBookForm({...bookForm, aboutAuthorBn: e.target.value})} className="w-full border rounded-lg px-3 py-2 bengali-text" rows={3} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 bengali-text">📄 বইয়ের কন্টেন্ট (পুরো টেক্সট)</label>
                      <textarea value={bookContent} onChange={e => setBookContent(e.target.value)} className="w-full border rounded-lg px-3 py-2 bengali-text" rows={8} placeholder="এখানে বইয়ের সম্পূর্ণ কন্টেন্ট পেস্ট করুন..." />
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="published" checked={bookForm.published} onChange={e => setBookForm({...bookForm, published: e.target.checked})} />
                      <label htmlFor="published" className="text-sm bengali-text">প্রকাশ করুন</label>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={saveBook} className="bg-[#1877F2] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium bengali-text">
                        {editingBook ? 'আপডেট করুন' : 'বই সেভ করুন'}
                      </button>
                      {editingBook && (
                        <button onClick={resetForm} className="border px-6 py-3 rounded-lg bengali-text">বাতিল</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">👥 ব্যবহারকারী তালিকা</h2>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left bengali-text">নাম</th>
                          <th className="px-4 py-3 text-left bengali-text">ইমেইল</th>
                          <th className="px-4 py-3 text-left bengali-text">কেনা বই</th>
                          <th className="px-4 py-3 text-left bengali-text">যোগদান</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{u.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3">{u.purchasedBooks?.length || 0} টি</td>
                            <td className="px-4 py-3 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && <p className="text-center py-8 text-gray-500 bengali-text">কোনো ব্যবহারকারী নেই</p>}
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">🛒 অর্ডার তালিকা</h2>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left">Order ID</th>
                          <th className="px-4 py-3 text-left bengali-text">ইমেইল</th>
                          <th className="px-4 py-3 text-left bengali-text">পরিমাণ</th>
                          <th className="px-4 py-3 text-left bengali-text">স্ট্যাটাস</th>
                          <th className="px-4 py-3 text-left bengali-text">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                            <td className="px-4 py-3">{order.userEmail}</td>
                            <td className="px-4 py-3">৳{order.totalAmount}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <p className="text-center py-8 text-gray-500 bengali-text">কোনো অর্ডার নেই</p>}
                  </div>
                </div>
              )}

              {/* Sales Report */}
              {activeTab === 'sales' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">💰 বিক্রয় রিপোর্ট</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-sm text-gray-500 bengali-text">মোট আয়</p>
                      <p className="text-2xl font-bold text-green-600">৳{totalRevenue}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-sm text-gray-500 bengali-text">মোট বিক্রয়</p>
                      <p className="text-2xl font-bold text-[#1877F2]">{totalSales}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-sm text-gray-500 bengali-text">গড় অর্ডার মূল্য</p>
                      <p className="text-2xl font-bold text-purple-600">৳{totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left bengali-text">তারিখ</th>
                          <th className="px-4 py-3 text-left bengali-text">বিক্রয় সংখ্যা</th>
                          <th className="px-4 py-3 text-left bengali-text">আয়</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {salesData.map((day: any) => (
                          <tr key={day.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{day.date}</td>
                            <td className="px-4 py-3">{day.totalSales}</td>
                            <td className="px-4 py-3 font-bold">৳{day.totalRevenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {salesData.length === 0 && <p className="text-center py-8 text-gray-500 bengali-text">কোনো বিক্রয় তথ্য নেই</p>}
                  </div>
                </div>
              )}

              {/* Wishlists */}
              {activeTab === 'wishlists' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">❤️ উইশলিস্ট অনুরোধ</h2>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left bengali-text">বই</th>
                          <th className="px-4 py-3 text-left bengali-text">লেখক</th>
                          <th className="px-4 py-3 text-left bengali-text">অনুরোধকারী</th>
                          <th className="px-4 py-3 text-left bengali-text">নোট</th>
                          <th className="px-4 py-3 text-left bengali-text">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {wishlists.map((w: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium bengali-text">{w.bookName}</td>
                            <td className="px-4 py-3 bengali-text">{w.authorName || '-'}</td>
                            <td className="px-4 py-3 text-gray-500">{w.userEmail}</td>
                            <td className="px-4 py-3 text-gray-500 bengali-text">{w.note || '-'}</td>
                            <td className="px-4 py-3 text-gray-500">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {wishlists.length === 0 && <p className="text-center py-8 text-gray-500 bengali-text">কোনো উইশলিস্ট অনুরোধ নেই</p>}
                  </div>
                </div>
              )}

              {/* Reviews placeholder */}
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 bengali-text">💬 রিভিউ ম্যানেজমেন্ট</h2>
                  <p className="text-gray-500 bengali-text bg-white p-8 rounded-xl border text-center">
                    রিভিউ ম্যানেজ করতে প্রতিটি বইয়ের রিভিউ সেকশনে যান
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
