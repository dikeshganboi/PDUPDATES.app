import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import AppShell from '../components/AppShell'
import ToastProvider from '../components/ToastProvider'
import RealtimeNotificationBridge from '../components/RealtimeNotificationBridge'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'PD Updates | Latest Jobs, Deals & Career Updates',
    template: '%s | PD Updates',
  },
  description: 'PD Updates — your go-to source for the latest jobs, deals & career updates. Stay updated. Stay ahead.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'PD Updates',
    title: 'PD Updates | Latest Jobs, Deals & Career Updates',
    description: 'PD Updates — your go-to source for the latest jobs, deals & career updates. Stay updated. Stay ahead.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PD Updates | Latest Jobs, Deals & Career Updates',
    description: 'PD Updates — your go-to source for the latest jobs, deals & career updates. Stay updated. Stay ahead.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakartaSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider />
          <RealtimeNotificationBridge />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
