import type { DetailedHTMLProps, HTMLAttributes } from 'react'

// Minimal JSX typing for the <model-viewer> web component (loaded lazily for AR).
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string
          'ios-src'?: string
          ar?: boolean
          'ar-modes'?: string
          'camera-controls'?: boolean
          'auto-rotate'?: boolean
          'shadow-intensity'?: string | number
          exposure?: string | number
          poster?: string
        },
        HTMLElement
      >
    }
  }
}
