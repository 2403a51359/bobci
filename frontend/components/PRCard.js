import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { GitPullRequest, User, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import RiskBadge from './RiskBadge'

export default function PRCard({ pr }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'analyzing':
        return 'Analyzing...'
      case 'complete':
        return 'Complete'
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const timeAgo = formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })

  return (
    <Link href={`/pr/${pr.id}`}>
      <div className="card hover:bg-dark-hover transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <GitPullRequest className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {pr.pr_title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                #{pr.pr_number} • {pr.repository_name}
              </p>
            </div>
          </div>
          <RiskBadge level={pr.risk_level} size="sm" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {getInitials(pr.pr_author)}
              </div>
              <span className="text-gray-400">{pr.pr_author}</span>
            </div>

            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getStatusIcon(pr.status)}
            <span className={`text-sm font-medium ${
              pr.status === 'complete' ? 'text-green-500' :
              pr.status === 'analyzing' ? 'text-blue-500' :
              pr.status === 'failed' ? 'text-red-500' :
              'text-gray-500'
            }`}>
              {getStatusText(pr.status)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Made with Bob
