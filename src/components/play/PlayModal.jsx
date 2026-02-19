'use client'

/**
 * PlayModal
 *
 * Full-screen overlay that expands a play item.
 * Layout:
 *   ┌──────────────────────────────────┐
 *   │ Title                        [✕] │  ← sticky header
 *   ├──────────────────────────────────┤
 *   │                                  │
 *   │   Component (interactive)        │  ← off-white, 60vh
 *   │                                  │
 *   ├──────────────────────────────────┤
 *   │  Tags · Year                     │
 *   │                                  │
 *   │  Process description text        │  ← scrollable prose
 *   └──────────────────────────────────┘
 *
 * Keyboard: Escape closes.
 * Scroll:   body scroll locked while open.
 * Portal:   renders directly into document.body to escape stacking contexts.
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const COMPONENT_BG = '#F0EFEB'

export default function PlayModal({ item, onClose }) {
  const { component: Component, title, year, tags, description } = item

  // ── Close on Escape ──
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // ── Lock body scroll ──
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return createPortal(
    <div
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: '#FAFAF9',
        zIndex:          100,
        overflowY:       'auto',
        animation:       'modalFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* ── Sticky header ── */}
      <div
        style={{
          position:        'sticky',
          top:             0,
          display:         'flex',
          justifyContent:  'space-between',
          alignItems:      'center',
          padding:         '0 32px',
          height:          '48px',
          borderBottom:    '1px solid #E8E8E4',
          backgroundColor: 'rgba(250, 250, 249, 0.88)',
          backdropFilter:  'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex:          1,
        }}
      >
        <span
          style={{
            fontSize:      '13px',
            color:         '#111',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </span>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '28px',
            height:         '28px',
            background:     'none',
            border:         '1px solid #DDD',
            borderRadius:   '50%',
            cursor:         'pointer',
            color:          '#666',
            fontSize:       '14px',
            fontFamily:     'inherit',
            lineHeight:     1,
            transition:     'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#111'
            e.currentTarget.style.color = '#111'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#DDD'
            e.currentTarget.style.color = '#666'
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Component area ── */}
      <div
        style={{
          backgroundColor: COMPONENT_BG,
          minHeight:       '60vh',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '48px 40px',
        }}
      >
        <Component />
      </div>

      {/* ── Process description ── */}
      <div
        style={{
          maxWidth:  '640px',
          margin:    '0 auto',
          padding:   '48px 24px 96px',
        }}
      >
        {/* Meta row */}
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '6px',
            marginBottom: '24px',
            flexWrap:     'wrap',
          }}
        >
          {tags?.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize:     '11px',
                color:        '#888',
                background:   '#EEEEE9',
                borderRadius: '4px',
                padding:      '2px 8px',
                letterSpacing:'0.01em',
              }}
            >
              {tag}
            </span>
          ))}
          <span
            style={{
              fontSize:   '12px',
              color:      '#BBB',
              marginLeft: 'auto',
            }}
          >
            {year}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize:   '15px',
            lineHeight: '1.75',
            color:      '#555',
            margin:     0,
            fontWeight: 400,
          }}
        >
          {description}
        </p>
      </div>
    </div>,
    document.body,
  )
}
