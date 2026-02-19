/**
 * Navbar
 *
 * Fixed horizontal top bar. Name on the left, page links on the right.
 * Active link is dark; inactive links are muted.
 *
 * Requires: react-router-dom (NavLink, useLocation)
 * Font:     Geist — set globally in index.css or App.jsx
 */

import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/work',     label: 'Work'     },
  { to: '/play',     label: 'Play'     },
  { to: '/info',     label: 'Info'     },
  { to: '/resume',   label: 'Resume'   },
  { to: '/writings', label: 'Writings' },
]

const linkStyle = ({ isActive }) => ({
  fontSize:       '13px',
  color:          isActive ? '#111' : '#999',
  textDecoration: 'none',
  letterSpacing:  '-0.005em',
  transition:     'color 0.15s ease',
  // hover is handled via CSS class below
})

export default function Navbar() {
  return (
    <>
      <style>{`
        .nav-link:hover { color: #111 !important; }
      `}</style>

      <nav
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          height:          '48px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '0 40px',
          borderBottom:    '1px solid #E8E8E4',
          backgroundColor: 'rgba(250, 250, 249, 0.88)',
          backdropFilter:  'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex:          50,
        }}
      >
        {/* ── Name / Logo ── */}
        <NavLink
          to="/"
          style={{
            fontSize:       '13px',
            fontWeight:     500,
            color:          '#111',
            textDecoration: 'none',
            letterSpacing:  '-0.02em',
          }}
        >
          Poro
        </NavLink>

        {/* ── Page links ── */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="nav-link"
              style={linkStyle}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
