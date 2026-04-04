import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { CheckCircle, XCircle } from 'lucide-react'

export const Route = createFileRoute('/payment-result')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || '',
    orderId: (search.orderId as string) || '',
  }),
  component: PaymentResultPage,
})

function PaymentResultPage() {
  const { status, orderId } = useSearch({ from: '/payment-result' })
  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {isSuccess ? (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 bengali-text">পেমেন্ট সফল!</h1>
            <p className="text-gray-500 mb-2 bengali-text">আপনার বই এখন পড়ার জন্য প্রস্তুত</p>
            {orderId && <p className="text-xs text-gray-400 mb-6">Order: {orderId}</p>}
            <div className="flex gap-3 justify-center">
              <Link to="/library" className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-medium bengali-text">আমার লাইব্রেরি</Link>
              <Link to="/books" className="border border-gray-300 px-6 py-3 rounded-lg font-medium bengali-text">আরো বই কিনুন</Link>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 bengali-text">পেমেন্ট ব্যর্থ</h1>
            <p className="text-gray-500 mb-6 bengali-text">আবার চেষ্টা করুন</p>
            <div className="flex gap-3 justify-center">
              <Link to="/checkout" className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-medium bengali-text">আবার চেষ্টা করুন</Link>
              <Link to="/" className="border border-gray-300 px-6 py-3 rounded-lg font-medium bengali-text">হোমে যান</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
