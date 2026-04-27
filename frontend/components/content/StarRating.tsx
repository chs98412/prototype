'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <div key={star} className="relative w-9 h-9">
            {/* Empty star */}
            <span className="absolute inset-0 flex items-center justify-center text-2xl text-border select-none">
              ★
            </span>
            {/* Half-filled */}
            {half && (
              <span
                className="absolute inset-0 flex items-center justify-center text-2xl text-accent select-none overflow-hidden"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              >
                ★
              </span>
            )}
            {/* Full-filled */}
            {full && (
              <span className="absolute inset-0 flex items-center justify-center text-2xl text-accent select-none">
                ★
              </span>
            )}
            {/* Click zones */}
            {!disabled && (
              <>
                <div
                  className="absolute left-0 top-0 w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHover(star - 0.5)}
                  onClick={() => onChange(star - 0.5)}
                />
                <div
                  className="absolute right-0 top-0 w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHover(star)}
                  onClick={() => onChange(star)}
                />
              </>
            )}
          </div>
        )
      })}
      {value > 0 && (
        <span className="self-center ml-1 text-text font-semibold text-sm">{value.toFixed(1)}</span>
      )}
    </div>
  )
}
