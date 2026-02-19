/**
 * PlayCard
 *
 * Wraps a play component in a contained display card.
 * The component renders live and interactive inside the off-white container.
 * Clicking anywhere on the card fires `onClick` to open the modal.
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
const CARD_BG = '#F0EFEB'

export default function PlayCard({ item, onClick }) {
  const { component: Component, title, year, tags, size = 'md' } = item

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
        style={{
          backgroundColor: CARD_BG,
          borderRadius:    '10px',
          minHeight:       SIZE_MAP[size],
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          overflow:        'hidden',
          position:        'relative',
          width:           '100%',
          transition:      'background-color 0.15s ease',
        }}
        // Subtle hover darkening on the container — JS because inline :hover isn't supported
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8E7E2'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = CARD_BG}
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
        <span style={{ fontSize: '13px', color: '#111', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <span style={{ fontSize: '12px', color: '#999' }}>
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
                fontSize:     '11px',
                color:        '#888',
                background:   '#E8E8E4',
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
