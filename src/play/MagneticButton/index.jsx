/**
 * MagneticButton
 *
 * The button is attracted toward the cursor when hovered within
 * a defined proximity zone. On leave, it springs back to origin.
 * Uses cubic-bezier easing to mimic elastic rebound.
 */

import { useRef, useState } from 'react'

const STRENGTH = 0.38 // 0–1: how strongly the button follows the cursor

export default function MagneticButton() {
  const zoneRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = zoneRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setOffset({
      x: (e.clientX - cx) * STRENGTH,
      y: (e.clientY - cy) * STRENGTH,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => {
    setIsHovered(false)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div
      ref={zoneRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: '56px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
      }}
    >
      <button
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isHovered
            ? 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)'
            : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          background: '#111111',
          color: '#ffffff',
          border: 'none',
          borderRadius: '999px',
          padding: '15px 32px',
          fontSize: '14px',
          letterSpacing: '0.02em',
          fontFamily: 'inherit',
          cursor: 'none',
          userSelect: 'none',
          willChange: 'transform',
        }}
      >
        Hover me
      </button>
    </div>
  )
}
