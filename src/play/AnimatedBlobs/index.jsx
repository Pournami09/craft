/**
 * AnimatedBlobs
 *
 * Three gaussian-blurred orbs drifting independently with CSS keyframe
 * animations. The `mix-blend-mode: multiply` layering creates rich
 * color mixing without canvas. Works on any background color.
 *
 * Tweak `ORBS` to change palette, count, or timing.
 */

const ORBS = [
  { color: '#A78BFA', size: 220, duration: '9s',  delay: '0s',   top: '10%', left: '15%' },
  { color: '#60A5FA', size: 200, duration: '12s', delay: '-3s',  top: '35%', left: '50%' },
  { color: '#F472B6', size: 180, duration: '10s', delay: '-6s',  top: '50%', left: '25%' },
]

const keyframes = `
  @keyframes blobDrift1 {
    0%, 100% { transform: translate(0px,   0px)  scale(1);    }
    33%       { transform: translate(40px, -50px) scale(1.08); }
    66%       { transform: translate(-20px, 30px) scale(0.94); }
  }
  @keyframes blobDrift2 {
    0%, 100% { transform: translate(0px,   0px)  scale(1);    }
    33%       { transform: translate(-35px, 40px) scale(0.92); }
    66%       { transform: translate(25px, -35px) scale(1.06); }
  }
  @keyframes blobDrift3 {
    0%, 100% { transform: translate(0px,  0px)   scale(1.04); }
    33%       { transform: translate(30px, 45px)  scale(0.9);  }
    66%       { transform: translate(-40px,-20px) scale(1.1);  }
  }
`

const driftAnims = ['blobDrift1', 'blobDrift2', 'blobDrift3']

export default function AnimatedBlobs() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '320px',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <style>{keyframes}</style>

      {ORBS.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: orb.color,
            filter: 'blur(52px)',
            opacity: 0.75,
            mixBlendMode: 'multiply',
            animation: `${driftAnims[i]} ${orb.duration} ease-in-out ${orb.delay} infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
