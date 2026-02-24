'use client'

/**
 * /play — Play page
 *
 * 'use client' because this page uses useState + useMemo.
 * All data comes from the local registry (src/play/index.js) — no fetching.
 *
 * Adding a new exploration:
 *   1. Build your component in src/play/YourComponent/index.jsx
 *   2. Register it in src/play/index.js
 *   Done. Nothing to change here.
 */

import { useState, useMemo, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { playItems } from '@/play'
import PlayCard      from '@/components/play/PlayCard'
import PlayModal     from '@/components/play/PlayModal'

const MASONRY_CSS = `
  .play-grid {
    columns: 3 340px;
    column-gap: 16px;
    padding: 32px 40px 96px;
  }
  @media (max-width: 860px) {
    .play-grid { columns: 2; padding: 24px 24px 72px; }
  }
  @media (max-width: 520px) {
    .play-grid { columns: 1; padding: 16px 16px 56px; }
  }
`

export default function Play() {
  const [activeTag,  setActiveTag]  = useState('All')
  const [activeItem, setActiveItem] = useState(null)
  const originRectRef = useRef(null)

  const allTags = useMemo(() => {
    const seen = new Set()
    playItems.forEach(item => item.tags?.forEach(t => seen.add(t)))
    return ['All', ...seen]
  }, [])

  const visibleItems = useMemo(() =>
    activeTag === 'All'
      ? playItems
      : playItems.filter(item => item.tags?.includes(activeTag)),
    [activeTag],
  )

  return (
    <>
      <style>{MASONRY_CSS}</style>

      <main style={{ minHeight: '100vh' }}>

        {/* ── Page header ── */}
        <header style={{ padding: '80px 40px 0' }}>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
              Play
            </h1>
            <span style={{ fontSize: '14px', color: '#767676' }}>
              {visibleItems.length} exploration{visibleItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Tag filter pills ── */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '32px', borderBottom: '1px solid #E8E8E4' }}>
            {allTags.map((tag) => {
              const isActive = activeTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="play-tag-btn"
                  style={{
                    fontSize:        '14px',
                    padding:         '5px 13px',
                    borderRadius:    '999px',
                    border:          '1px solid',
                    borderColor:     isActive ? '#111' : '#DDD',
                    backgroundColor: isActive ? '#111' : 'transparent',
                    color:           isActive ? '#fff' : '#696969',
                    cursor:          'pointer',
                    letterSpacing:   '-0.005em',
                  }}
                  onMouseEnter={e => {
                    if (isActive) return
                    e.currentTarget.style.borderColor = '#111'
                    e.currentTarget.style.color = '#111'
                  }}
                  onMouseLeave={e => {
                    if (isActive) return
                    e.currentTarget.style.borderColor = '#DDD'
                    e.currentTarget.style.color = '#696969'
                  }}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </header>

        {/* ── Masonry grid ── */}
        <div className="play-grid">
          {visibleItems.map((item) => (
            <PlayCard
              key={item.id}
              item={item}
              onClick={(e) => {
                originRectRef.current = e.currentTarget.getBoundingClientRect()
                setActiveItem(item)
              }}
            />
          ))}
        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {activeItem && (
            <PlayModal
              key={activeItem.id}
              item={activeItem}
              originRect={originRectRef.current}
              onClose={() => setActiveItem(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
