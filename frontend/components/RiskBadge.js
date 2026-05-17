import clsx from 'clsx'

export default function RiskBadge({ level, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const colorClasses = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse-slow'
  }

  const emoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  }

  if (!level) {
    return (
      <span className={clsx(
        'badge border',
        sizeClasses[size],
        'bg-gray-500/10 text-gray-500 border-gray-500/20'
      )}>
        ⚪ Unknown
      </span>
    )
  }

  const normalizedLevel = level.toLowerCase()

  return (
    <span className={clsx(
      'badge border font-semibold',
      sizeClasses[size],
      colorClasses[normalizedLevel]
    )}>
      {emoji[normalizedLevel]} {level.toUpperCase()}
    </span>
  )
}

// Made with Bob
