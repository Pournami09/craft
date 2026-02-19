/**
 * Root layout
 *
 * Wraps every page with the Navbar and global styles.
 * Geist is loaded via next/font/local — no external request, zero layout shift.
 *
 * Setup: run `npm install geist` to get the font package,
 * or swap `next/font/local` for `next/font/google` if you prefer the CDN.
 */

import { GeistSans } from 'geist/font/sans'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata = {
  title:       'Poro',
  description: 'Design engineer portfolio — work, play, and process.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
