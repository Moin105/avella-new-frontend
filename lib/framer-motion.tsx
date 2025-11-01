import * as React from "react"

type MotionProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: Record<string, unknown>
  animate?: Record<string, unknown>
  transition?: Record<string, unknown>
  whileInView?: Record<string, unknown>
}

const MotionDiv = React.forwardRef<HTMLDivElement, MotionProps>(function MotionDiv(
  { initial: _initial, animate: _animate, transition: _transition, whileInView: _whileInView, ...rest },
  ref,
) {
  return <div ref={ref} {...rest} />
})

export const motion = {
  div: MotionDiv,
}
