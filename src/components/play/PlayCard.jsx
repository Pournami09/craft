'use client'

/**
 * PlayCard
 *
 * Wraps a play component in a contained display card.
 * The component renders live and interactive inside the off-white container.
 * Clicking anywhere on the card fires `onClick` to open the modal.
 *
 * 'use client' — event handlers (onClick, onMouseEnter/Leave).
 *
 * Props:
 *   item     – registry item object
 *   onClick  – callback to open the modal for this item
 */

const SIZE_MAP = {
  sm: 260,
  md: 380,
  lg: 520,
}

// Single token — change to retheme all cards
const CARD_BG = '#FFFFFF'

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

export default function PlayCard({ item, onClick }) {
  const { component: Component, title, year, tags, size = 'md', padding: componentPadding = 0 } = item

  return (
    <div
      onClick={onClick}
      style={{
        breakInside: 'avoid',
        marginBottom: '16px',
        cursor:       'pointer',
      }}
    >
      {/* ── Component container ── */}
      <div
        className="play-card-inner"
        style={{
          backgroundColor: CARD_BG,
          borderRadius:    '10px',
          minHeight:       '-webkit-fill-available',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          overflow:        'hidden',
          position:        'relative',
          width:           '100%',
          padding:         componentPadding,
        }}
        onMouseEnter={e => {
          if (canHover()) e.currentTarget.style.backgroundColor = '#E9E8E5'
        }}
        onMouseLeave={e => {
          if (canHover()) e.currentTarget.style.backgroundColor = CARD_BG
        }}
      >
        <Component />
      </div>

      {/* ── Label row ── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'baseline',
          marginTop:      '10px',
          padding:        '0 2px',
        }}
      >
        <span style={{ fontSize: '14px', color: '#111', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <span style={{ fontSize: '14px', color: '#767676' }}>
          {year}
        </span>
      </div>

      {/* ── Tags ── */}
      {tags?.length > 0 && (
        <div
          style={{
            display:    'flex',
            gap:        '6px',
            marginTop:  '6px',
            padding:    '0 2px',
            flexWrap:   'wrap',
          }}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize:     '14px',
                color:        '#646464',
                background:   '#FFFFFF',
                borderRadius: '4px',
                padding:      '2px 8px',
                letterSpacing:'0.01em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
