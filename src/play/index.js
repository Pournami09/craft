/**
 * Play Registry
 *
 * Single source of truth for every exploration on the Play page.
 * To add a new one: build your component in src/play/YourComponent/,
 * import it here, and push an entry to the array.
 *
 * Schema:
 *   id          – unique slug, used as React key
 *   title       – display name
 *   year        – string, shown in modal meta
 *   tags        – string[], drives the filter pills and modal tags
 *   size        – 'sm' | 'md' | 'lg' → card min-height (260 | 380 | 520px)
 *   description – plain string shown in the modal below the component
 *   component   – the React component (rendered live, interactive)
 */

import MagneticButton from './MagneticButton'
import AnimatedBlobs  from './AnimatedBlobs'

export const playItems = [
  {
    id:          'magnetic-button',
    title:       'Magnetic Button',
    year:        '2025',
    tags:        ['interaction', 'physics', 'cursor'],
    size:        'sm',
    description: 'Exploring magnetic attraction as a spatial metaphor for affordance. The button senses cursor proximity and displaces toward it proportionally — creating a pull that makes clicking feel earned. Built with raw pointer offset math and a cubic-bezier spring return, no animation library.',
    component:   MagneticButton,
  },
  {
    id:          'animated-blobs',
    title:       'Fluid Gradient',
    year:        '2025',
    tags:        ['generative', 'css', 'animation'],
    size:        'md',
    description: 'Three Gaussian-blurred orbs drifting on independent animation cycles with mix-blend-mode: multiply for color mixing without canvas overhead. Wanted to see how much organic motion I could extract from pure CSS — no JS, no canvas, no WebGL. The answer: quite a lot.',
    component:   AnimatedBlobs,
  },
  // ↓ drop your next exploration here
]
