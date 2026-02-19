/**
 * Play page
 *
 * Features:
 *   • Static tag filter pills in the header (All + tags from registry)
 *   • CSS-columns masonry grid (3 → 2 → 1 at breakpoints)
 *   • Click any card → fullscreen PlayModal with component + process description
 *
 * Adding a new exploration:
 *   1. Build your component in src/play/YourComponent/index.jsx
 *   2. Register it in src/play/index.js
 *   Done. Nothing to change here.
 *
 * Requires: react-router-dom (used in Navbar)
 * Font:     Geist — import in index.css (see note below)
 *
 * Geist setup (add to index.css):
 *   @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');
 *   * { font-family: 'Geist', system-ui, sans-serif; }
 */

import { useState, useMemo } from 'react'
import { playItems }  from '../play'
import PlayCard       from '../components/play/PlayCard'
import PlayModal      from '../components/play/PlayModal'

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

  // Derive unique tags from the full registry (preserving insertion order)
  const allTags = useMemo(() => {
    const seen = new Set()
    playItems.forEach(item => item.tags?.forEach(t => seen.add(t)))
    return ['All', ...seen]
  }, [])

  // Filter items
  const visibleItems = useMemo(() =>
    activeTag === 'All'
      ? playItems
      : playItems.filter(item => item.tags?.includes(activeTag)),
    [activeTag],
  )

  return (
    <>
      <style>{MASONRY_CSS}</style>

      <main
        style={{
          paddingTop: '48px', // offset for fixed Navbar
          minHeight:  '100vh',
        }}
      >
        {/* ── Page header ── */}
        <header style={{ padding: '56px 40px 0' }}>

          {/* Title + count */}
          <div
            style={{
              display:     'flex',
              alignItems:  'baseline',
              gap:         '10px',
              marginBottom:'20px',
            }}
          >
            <h1
              style={{
                fontSize:      '13px',
                fontWeight:    400,
                color:         '#111',
                margin:        0,
                letterSpacing: '-0.01em',
              }}
            >
              Play
            </h1>
            <span style={{ fontSize: '12px', color: '#BBB' }}>
              {visibleItems.length} exploration{visibleItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Tag filter pills ── */}
          <div
            style={{
              display:       'flex',
              gap:           '6px',
              flexWrap:      'wrap',
              paddingBottom: '32px',
              borderBottom:  '1px solid #E8E8E4',
            }}
          >
            {allTags.map((tag) => {
              const isActive = activeTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  style={{
                    fontSize:        '12px',
                    padding:         '5px 13px',
                    borderRadius:    '999px',
                    border:          '1px solid',
                    borderColor:     isActive ? '#111' : '#DDD',
                    backgroundColor: isActive ? '#111' : 'transparent',
                    color:           isActive ? '#fff' : '#777',
                    cursor:          'pointer',
                    fontFamily:      'inherit',
                    letterSpacing:   '-0.005em',
                    transition:      'all 0.15s ease',
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
              onClick={() => setActiveItem(item)}
            />
          ))}
        </div>

        {/* ── Modal ── */}
        {activeItem && (
          <PlayModal
            item={activeItem}
            onClose={() => setActiveItem(null)}
          />
        )}
      </main>
    </>
  )
}
