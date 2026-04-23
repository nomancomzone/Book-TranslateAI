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
              <a href="mailto:nomancomzone@gmail.com" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" title="Gmail">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2 bengali-text">nomancomzone@gmail.com</p>
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
