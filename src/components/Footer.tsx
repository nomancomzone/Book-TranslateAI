import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📚</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg bengali-text">TranslatedBook</h3>
                <p className="text-xs text-gray-400">Bengali eBook Store</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 bengali-text">
              বাংলা ভাষায় বিশ্বের সেরা বইগুলো পড়ুন। আমাদের সংগ্রহে আছে হাজারো বই।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 bengali-text">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#1877F2] transition-colors bengali-text">হোম</Link></li>
              <li><Link to="/books" className="hover:text-[#1877F2] transition-colors bengali-text">সব বই</Link></li>
              <li><Link to="/books" search={{ sort: 'new' }} className="hover:text-[#1877F2] transition-colors bengali-text">নতুন বই</Link></li>
              <li><Link to="/books" search={{ sort: 'popular' }} className="hover:text-[#1877F2] transition-colors bengali-text">জনপ্রিয় বই</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 bengali-text">অ্যাকাউন্ট</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="hover:text-[#1877F2] transition-colors bengali-text">আমার অ্যাকাউন্ট</Link></li>
              <li><Link to="/library" className="hover:text-[#1877F2] transition-colors bengali-text">আমার লাইব্রেরি</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#1877F2] transition-colors bengali-text">উইশলিস্ট</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 bengali-text">যোগাযোগ</h4>
           <div className="flex gap-4">
              <a href="https://wa.me/8801540525206" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors" title="WhatsApp">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://mail.google.com/mail/?view=cm&to=nomancomzone@gmail.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200" title="Gmail">
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-1 bengali-text">সকাল ১০টা - রাত ১০টা</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          <p className="bengali-text">© {new Date().getFullYear()} TranslatedBook। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  )
}
