'use client'

interface MarloWordmarkProps {
  size?: number
  light?: boolean
  className?: string
}

export function MarloWordmark({ size = 28, light = false, className = '' }: MarloWordmarkProps) {
  const textColor = light ? '#FDFAF6' : '#1A1917'
  const dotColor  = '#C4603A'

  return (
    <div
      className={`flex items-baseline gap-0 select-none ${className}`}
      style={{
        fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
        fontSize:   size,
        fontWeight: 400,
        letterSpacing: '-0.01em',
        color: textColor,
        lineHeight: 1,
      }}
    >
      marlo
      <span style={{ color: dotColor, fontSize: size * 0.5, lineHeight: 1, marginBottom: -2 }}>
        •
      </span>
    </div>
  )
}
