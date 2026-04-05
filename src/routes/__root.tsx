import { HeadContent, Scripts, createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { AuthProvider } from '@/lib/auth-context'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartSidebar } from '@/components/CartSidebar'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TranslatedBook - বাংলা ইবুক স্টোর | TranslatedBook Bengali eBook Store' },
      {
        name: 'description',
        content: 'বাংলা ইবুক কিনুন ও পড়ুন। সেরা বাংলা বইয়ের সংগ্রহ। Buy and read Bengali eBooks online.',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const router = useRouterState()
  const isReaderPage = router.location.pathname.startsWith('/read/')

  if (isReaderPage) {
    return (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <Header />
      <CartSidebar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </AuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <HeadContent />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen no-print">
        {children}
        <Scripts />
      </body>
    </html>
  )
}