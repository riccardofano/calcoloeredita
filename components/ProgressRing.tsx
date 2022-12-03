import Fraction from 'fraction.js'

interface ProgressRingProps {
  fraction: string
}

function ProgressRing({ fraction }: ProgressRingProps) {
  const radius = 24
  const stroke = 5

  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const progress = new Fraction(fraction).valueOf()
  const strokeDashoffset = circumference - progress * circumference

  return (
    <span className="flex items-center justify-end">
      {fraction ?? 0}
      <svg className="text-green-600 ml-1 -rotate-90" width={radius * 2} height={radius * 2}>
        <circle
          className="text-primary-100"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="text-primary-500"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ strokeLinecap: 'round' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </span>
  )
}

export default ProgressRing
