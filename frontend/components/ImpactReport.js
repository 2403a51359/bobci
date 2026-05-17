import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import RiskBadge from './RiskBadge'

export default function ImpactReport({ data }) {
  const [showSafeFiles, setShowSafeFiles] = useState(false)

  if (!data) {
    return <div className="text-gray-400">No impact analysis available</div>
  }

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'approve':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'request_changes':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'block':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const recommendation = data.recommendation || 'request_changes'
  const recommendationText = recommendation.replace(/_/g, ' ').toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Impact Analysis</h3>
          <p className="text-gray-400">Understanding what this PR affects</p>
        </div>
        <RiskBadge level={data.risk_level} size="lg" />
      </div>

      <div className={`card border-2 ${getRecommendationColor(recommendation)}`}>
        <div className="flex items-center space-x-3">
          {recommendation === 'approve' && <CheckCircle className="w-6 h-6" />}
          {recommendation === 'request_changes' && <AlertTriangle className="w-6 h-6" />}
          {recommendation === 'block' && <XCircle className="w-6 h-6" />}
          <div>
            <p className="text-sm font-medium opacity-75">Recommendation</p>
            <p className="text-lg font-bold">{recommendationText}</p>
          </div>
        </div>
      </div>

      {data.direct_impact && data.direct_impact.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Direct Impact</span>
          </h4>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">File</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Reason</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Breaks?</th>
                </tr>
              </thead>
              <tbody>
                {data.direct_impact.map((item, index) => (
                  <tr key={index} className="border-b border-dark-border last:border-0">
                    <td className="py-3 px-4">
                      <code className="text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {item.file}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.reason}</td>
                    <td className="py-3 px-4 text-center">
                      {item.likely_breaks ? (
                        <span className="inline-flex items-center space-x-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">Yes</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">No</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.indirect_impact && data.indirect_impact.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Indirect Impact</span>
          </h4>
          <div className="card space-y-2">
            {data.indirect_impact.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-dark-bg rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <code className="text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {item.file}
                  </code>
                  <p className="text-gray-300 mt-1">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.safe_files && data.safe_files.length > 0 && (
        <div>
          <button
            onClick={() => setShowSafeFiles(!showSafeFiles)}
            className="flex items-center space-x-2 text-lg font-semibold text-white hover:text-blue-400 transition-colors mb-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Safe Files ({data.safe_files.length})</span>
            {showSafeFiles ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {showSafeFiles && (
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.safe_files.slice(0, 50).map((file, index) => (
                  <code key={index} className="text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    {file}
                  </code>
                ))}
              </div>
              {data.safe_files.length > 50 && (
                <p className="text-gray-400 text-sm mt-3">
                  ...and {data.safe_files.length - 50} more files
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Made with Bob
