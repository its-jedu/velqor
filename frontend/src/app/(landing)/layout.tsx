import type { Metadata } from 'next'
import Navbar from '@/components/landing-page/layouts/navbar'
import Footer from '@/components/landing-page/layouts/footer'

export const metadata: Metadata = {
  title: 'Velqor - Compete. Conquer. Cash Out.',
  description: 'Join tournaments, battle players, and win real money on Velqor, the premier eSports tournament platform.',
  keywords: 'eSports, tournaments, gaming, compete, win money, Velqor',
  openGraph: {
    title: 'Velqor - eSports Tournament Platform',
    description: 'Compete in professional gaming tournaments and win real money prizes',
    type: 'website',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}