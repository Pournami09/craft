'use client'

/**
 * Navbar
 *
 * Fixed horizontal top bar. Name on the left, page links on the right.
 * Uses next/link for navigation and usePathname for active state.
 *
 * 'use client' — required for usePathname hook.
 */

import Link            from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/work',     label: 'Work'     },
  { href: '/play',     label: 'Play'     },
  { href: '/info',     label: 'Info'     },
  { href: '/resume',   label: 'Resume'   },
  { href: '/writings', label: 'Writings' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position:             'fixed',
        top:                  0,
        left:                 0,
        right:                0,
        height:               '48px',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'space-between',
        padding:              '0 40px',
        borderBottom:         '1px solid #E8E8E4',
        backgroundColor:      'rgba(250, 250, 249, 0.88)',
        backdropFilter:       'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex:               50,
      }}
    >
      {/* ── Name ── */}
      <Link
        href="/"
        style={{
          fontSize:      '13px',
          fontWeight:    500,
          color:         '#111',
          letterSpacing: '-0.02em',
        }}
      >
        Poro
      </Link>

      {/* ── Page links ── */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                fontSize:      '13px',
                color:         isActive ? '#111' : '#999',
                letterSpacing: '-0.005em',
                transition:    'color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#111'}
              onMouseLeave={e => e.currentTarget.style.color = isActive ? '#111' : '#999'}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
