import { forwardRef } from 'react'

// jsdom does not implement HTMLCanvasElement.getContext(), which lottie-web requires.
// This no-op mock replaces lottie-react in the test environment (via vite.config.ts test.alias).
const Lottie = forwardRef<HTMLDivElement, { 'aria-hidden'?: boolean }>(
  ({ 'aria-hidden': ariaHidden, ...rest }, ref) => (
    <div ref={ref} aria-hidden={ariaHidden} data-testid="lottie-mock" {...rest} />
  ),
)
Lottie.displayName = 'Lottie'
export default Lottie
