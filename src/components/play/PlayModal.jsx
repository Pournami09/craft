'use client'

/**
 * PlayModal
 *
 * Centered floating panel with a dimmed backdrop.
 * Layout:
 *   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← dimmed backdrop (click to close)
 *   ░░  ┌──────────────────────────────┐  ░░
 *   ░░  │  Component (interactive)     │  ░░
 *   ░░  ├──────────────────────────────┤  ░░
 *   ░░  │  Tags · Year                 │  ░░
 *   ░░  │  Description                 │  ░░
 *   ░░  └──────────────────────────────┘  ░░
 *   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 *              [×]                          ← floating close button
 *
 * Keyboard: Escape closes.
 * Scroll:   body scroll locked while open.
 * Portal:   renders directly into document.body.
 *
 * Animation: Genie effect on close using cubic-bezier clip-path:
 *
 *   Every keyframe is a path() with this exact structure:
 *     M TLx,0  L TRx,0                       ← top edge
 *     C TRx,rCP1y  rCP2x,rCP2y  BRx,H        ← right side
 *     L BLx,H                                 ← bottom edge (the pinch)
 *     C lCP1x,lCP1y  TLx,lCP2y  TLx,0        ← left side (mirror of right)
 *     Z
 *
 *   Both buildFullRect and buildGenieKeyframes produce this same structure so
 *   Framer Motion can interpolate the 18 numbers between all keyframes cleanly.
 *
 *   Right side bezier mechanics:
 *     CP1 = (TRx, H*cpT)   — tangent is straight down at the top corner;
 *                             the edge hugs the corner then sweeps inward.
 *     CP2 = straight-line  − pull  — pulled left of the TRx→BRx line near
 *                             the bottom, creating the concave "sucked in" curve.
 *
 *   Origin-awareness: ratio is the card's horizontal offset from modal center.
 *   The near side (toward the card) stays rigid; the far side sweeps hard.
 *
 *   ratio = -1 → left side rigid, right sweeps
 *   ratio =  0 → symmetric
 *   ratio = +1 → right side rigid, left sweeps
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'

const EASE_OUT_QUINT = [0.23, 1, 0.32, 1]

const lerp = (a, b, t) => a + (b - a) * t
const f    = v => v.toFixed(2)

// ─── Path helpers ─────────────────────────────────────────────────────────────

/**
 * Full rectangle as a cubic-bezier path.
 * Straight sides are represented as degenerate beziers (all control points
 * on the edge) so the SVG command structure matches buildGenieKeyframes exactly.
 */
function buildFullRect(W, H) {
  const cy1 = f(H * 0.33)
  const cy2 = f(H * 0.67)
  // Right: (W,0)→(W,H), both CPs on the right edge → straight line
  // Left:  (0,H)→(0,0), both CPs on the left edge → straight line
  return `path('M 0,0 L ${W},0 C ${W},${cy1} ${W},${cy2} ${W},${H} L 0,${H} C 0,${cy2} 0,${cy1} 0,0 Z')`
}

/**
 * Four intermediate genie keyframes.
 *
 * Stage 1 — bottom pinches in while the top stays full-width. The sides are
 *   concave curves — the upper portion hugs the original edge, the lower
 *   portion swoops inward. Looks like paper being sucked from below.
 * Stage 2 — more aggressive inward sweep (peak concavity). Like a vase shape.
 * Stage 3 — top corners start following. The whole thing narrows.
 * Stage 4 — almost a vertical line at the center. Opacity takes it out.
 */
function buildGenieKeyframes(ratio, W, H) {
  const nearRight = Math.max(0, ratio)
  const nearLeft  = Math.max(0, -ratio)

  // Each stage: TL/TR/BR/BL as fractions of W; pull as fraction of W;
  // cpT = y-fraction for the upper control point (where the tangent is vertical);
  // cpB = y-fraction for the lower control point (where the inward pull is applied).
  const sym = [
    { TL: 0,    TR: 1,    BR: 0.72, BL: 0.28, pull: 0.04, cpT: 0.25, cpB: 0.70 },
    { TL: 0,    TR: 1,    BR: 0.54, BL: 0.46, pull: 0.07, cpT: 0.22, cpB: 0.68 },
    { TL: 0.08, TR: 0.92, BR: 0.51, BL: 0.49, pull: 0.05, cpT: 0.20, cpB: 0.65 },
    { TL: 0.50, TR: 0.50, BR: 0.50, BL: 0.50, pull: 0.01, cpT: 0.33, cpB: 0.67 },
  ]

  // Anchored (near side stays rigid): BRx/BLx barely move, pull is tiny.
  const anc = [
    { TL: 0,    TR: 1,    BR: 0.95, BL: 0.05, pull: 0.01, cpT: 0.25, cpB: 0.70 },
    { TL: 0,    TR: 1,    BR: 0.90, BL: 0.10, pull: 0.01, cpT: 0.22, cpB: 0.68 },
    { TL: 0.02, TR: 0.98, BR: 0.88, BL: 0.12, pull: 0.01, cpT: 0.20, cpB: 0.65 },
    { TL: 0.50, TR: 0.50, BR: 0.50, BL: 0.50, pull: 0.01, cpT: 0.33, cpB: 0.67 },
  ]

  return sym.map((s, i) => {
    const a = anc[i]

    const TLx   = lerp(s.TL,   a.TL,   nearLeft)  * W
    const TRx   = lerp(s.TR,   a.TR,   nearRight) * W
    const BRx   = lerp(s.BR,   a.BR,   nearRight) * W
    const BLx   = lerp(s.BL,   a.BL,   nearLeft)  * W
    const pullR = lerp(s.pull, a.pull, nearRight) * W
    const pullL = lerp(s.pull, a.pull, nearLeft)  * W
    const { cpT, cpB } = s

    // ── Right bezier: (TRx, 0) → (BRx, H) ──
    // CP1: tangent goes straight down at the top corner (no outward bow needed —
    //   the concave sweep below is the paper-like quality).
    // CP2: pulled inward (left) from the straight TRx→BRx line near the bottom.
    //   Straight-line x at cpB height = TRx + (BRx − TRx) * cpB
    //   CP2x = that − pullR  →  concave inward curve
    const rCP1x = TRx
    const rCP1y = H * cpT
    const rCP2x = TRx + (BRx - TRx) * cpB - pullR
    const rCP2y = H * cpB

    // ── Left bezier: (BLx, H) → (TLx, 0)  (mirror of right) ──
    // CP1: pulled inward (right) from the BLx→TLx line near the bottom.
    //   Straight-line x at (1−cpB) fraction from BLx toward TLx = BLx + (TLx−BLx)*(1−cpB)
    //   CP1x = that + pullL  →  concave inward curve
    // CP2: tangent goes straight up at the top corner.
    const lCP1x = BLx + (TLx - BLx) * (1 - cpB) + pullL
    const lCP1y = H * cpB
    const lCP2x = TLx
    const lCP2y = H * cpT

    return `path('M ${f(TLx)},0 L ${f(TRx)},0 C ${f(rCP1x)},${f(rCP1y)} ${f(rCP2x)},${f(rCP2y)} ${f(BRx)},${H} L ${f(BLx)},${H} C ${f(lCP1x)},${f(lCP1y)} ${f(lCP2x)},${f(lCP2y)} ${f(TLx)},0 Z')`
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlayModal({ item, originRect, onClose }) {
  const { component: Component, title, year, tags, description, padding: componentPadding = '48px 40px' } = item
  const shouldReduceMotion = useReducedMotion()

  const panelRef = useRef(null)

  const [genieState, setGenieState] = useState({
    ratio:           0,
    transformOrigin: '50% bottom',
  })

  // Compute pixel-based modal geometry, the full-rect path (needed for both
  // the entry/animate clip-path and as the first genie keyframe), and the
  // card-derived entry initial state.
  const { modalLeft, modalWidth, modalHeight, fullRect, panelInitial } = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth  : 1024
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768
    const mw = Math.min(640, vw - 48)
    const mh = vh - 120
    const ml = (vw - mw) / 2
    const fr = buildFullRect(mw, mh)

    if (!originRect) {
      return {
        modalLeft: ml, modalWidth: mw, modalHeight: mh, fullRect: fr,
        panelInitial: { clipPath: fr, opacity: 0, y: -8, scale: 0.97 },
      }
    }

    const cardCenterX = originRect.left + originRect.width  / 2
    const cardCenterY = originRect.top  + originRect.height / 2

    // For left/right column cards: use the card's inner edge (the side closest
    // to the viewport center) so the modal slides inward from a short distance.
    // For center-column cards: use cardCenterX unchanged — they're already near
    // the modal's resting position so the inner-edge offset adds no value.
    // vw/6 threshold correctly isolates the middle column in a 3-col grid.
    const distFromCenter = Math.abs(cardCenterX - vw / 2)
    const startX = distFromCenter < vw / 6
      ? cardCenterX
      : cardCenterX < vw / 2
        ? originRect.left + originRect.width   // left card → right (inner) edge
        : originRect.left                      // right card → left (inner) edge

    return {
      modalLeft:   ml,
      modalWidth:  mw,
      modalHeight: mh,
      fullRect:    fr,
      panelInitial: {
        clipPath: fr,
        x:        startX - (ml + mw / 2),
        y:        cardCenterY - (40 + mh / 2),
        scale:    0.92,
        opacity:  0,
      },
    }
  }, [originRect])

  // ── Compute genie state from originRect ───────────────────────────────────
  //
  // Derived purely from originRect + viewport width — never from the panel's
  // measured position. Measuring via getBoundingClientRect() after mount is
  // unreliable: the panel is still at its panelInitial offset (wherever the
  // opening animation starts from) and hasn't reached its rest position yet.
  //
  // The panel's rest center is always vw/2 by construction (left: modalLeft,
  // width: modalWidth, modalLeft = (vw − modalWidth) / 2), so:
  //   dx    = cardCenterX − vw/2
  //   ratio = dx / (vw/2), clamped to [−1, 1]
  //
  // This is completely decoupled from the opening animation's startX, so
  // changes to how the modal opens never affect the closing direction.
  useEffect(() => {
    if (shouldReduceMotion) return

    const vw = window.innerWidth
    const cardCenterX = originRect
      ? originRect.left + originRect.width / 2
      : vw / 2

    const ratio = Math.max(-1, Math.min(1, (cardCenterX - vw / 2) / (vw / 2)))

    setGenieState({
      ratio,
      transformOrigin: `${50 + ratio * 50}% bottom`,
    })
  }, [shouldReduceMotion, originRect])

  // ── Build exit animation ───────────────────────────────────────────────────
  //
  // clipPath: bezier curves warp the sides like paper being sucked downward.
  //   Origin-awareness lives here: ratio controls which side stays rigid vs
  //   sweeps, so a left-column card keeps its left edge and a right-column
  //   card keeps its right edge — without the modal drifting horizontally.
  // scaleY:   compresses the modal vertically from the bottom anchor point.
  // y:        28px downward drift — panel bottom lands on the close button.
  //   No x translation: the modal always collapses straight toward the
  //   close button regardless of which column the card was in.
  const genieExit = useMemo(() => {
    if (shouldReduceMotion) return { opacity: 0 }

    const { ratio } = genieState
    // Clip-path is always symmetric (ratio=0): the modal collapses straight down
    // toward the centered close button, so both sides should sweep equally.
    // ratio still drives transformOrigin so scaleY pivots toward the card's column.
    const genieFrames = [fullRect, ...buildGenieKeyframes(0, modalWidth, modalHeight)]

    return {
      clipPath: genieFrames,
      filter:   ['blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(2px)', 'blur(2px)'],
      opacity:  [1, 1, 0.95, 0.5, 0],
      scaleY:   [1, 0.96, 0.78, 0.42, 0.05],
      y:        [0, 2, 8, 18, 28],
      transition: {
        duration: 0.45,
        ease:     EASE_OUT_QUINT,
        times:    [0, 0.2, 0.45, 0.72, 1],
      },
    }
  }, [shouldReduceMotion, genieState, fullRect, modalWidth, modalHeight])

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
    <>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'ease' }}
        onClick={onClose}
        style={{
          position:        'fixed',
          inset:           0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex:          100,
        }}
      />

      {/* ── Panel ── */}
      <motion.div
        ref={panelRef}
        initial={shouldReduceMotion ? false : panelInitial}
        animate={{ clipPath: fullRect, x: 0, y: 0, scale: 1, opacity: 1 }}
        exit={genieExit}
        transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
        style={{
          position:        'fixed',
          top:             '40px',
          left:            `${modalLeft}px`,
          width:           `${modalWidth}px`,
          height:          `${modalHeight}px`,
          backgroundColor: '#FFFFFF',
          borderRadius:    '16px',
          zIndex:          101,
          overflowY:       'auto',
          boxShadow:       '0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          transformOrigin: genieState.transformOrigin,
          willChange:      'transform, clip-path, opacity',
        }}
      >
        {/* ── Component area ── */}
        <div style={{ padding: '24px 24px 0' }}>
          <div
            style={{
              backgroundColor: '#F5F5F3',
              minHeight:       '280px',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              padding:         componentPadding,
              borderRadius:    '10px',
            }}
          >
            <Component />
          </div>
        </div>

        {/* ── Process description ── */}
        <div style={{ padding: '32px 24px 32px' }}>
          {/* Meta row */}
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              marginBottom: '20px',
              flexWrap:     'wrap',
            }}
          >
            {tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize:      '14px',
                  color:         '#646464',
                  background:    '#F0EFEB',
                  borderRadius:  '4px',
                  padding:       '2px 8px',
                  letterSpacing: '0.01em',
                }}
              >
                {tag}
              </span>
            ))}
            <span
              style={{
                fontSize:   '14px',
                color:      '#767676',
                marginLeft: 'auto',
              }}
            >
              {year}
            </span>
          </div>

          {/* Title */}
          <p
            style={{
              fontSize:      '20px',
              fontWeight:    600,
              color:         '#111',
              margin:        '0 0 10px',
              letterSpacing: '-0.02em',
              lineHeight:    '1.3',
            }}
          >
            {title}
          </p>

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
      </motion.div>

      {/* ── Close button ── */}
      <motion.button
        onClick={onClose}
        aria-label="Close"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        whileHover={shouldReduceMotion ? {} : {
          scale:           1.1,
          backgroundColor: '#F5F5F3',
          color:           '#111',
          boxShadow:       '0 6px 20px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08)',
        }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
        style={{
          position:        'fixed',
          bottom:          '32px',
          left:            '50%',
          x:               '-50%',
          width:           '40px',
          height:          '40px',
          borderRadius:    '50%',
          border:          '1px solid #E0E0DC',
          backgroundColor: '#fff',
          cursor:          'pointer',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        '18px',
          color:           '#646464',
          zIndex:          102,
          boxShadow:       '0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06)',
        }}
      >
        ×
      </motion.button>
    </>,
    document.body,
  )
}
