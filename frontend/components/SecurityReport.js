import { Shield, AlertTriangle, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import RiskBadge from './RiskBadge'

export default function SecurityReport({ data }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    if (data?.overall_score) {
      const duration = 1500
      const steps = 60
      const increment = data.overall_score / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= data.overall_score) {
          setAnimatedScore(data.overall_score)
          clearInterval(timer)
        } else {
          setAnimatedScore(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [data?.overall_score])

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!data) {
    return <div className="text-gray-400">No security analysis available</div>
  }

  const score = data.overall_score || 0
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'safe_to_merge':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'fix_before_merge':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'block_immediately':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-green-500/10 text-green-500 border-green-500/20'
    }
    return colors[severity?.toLowerCase()] || colors.medium
  }

  const recommendation = data.recommendation || 'fix_before_merge'
  const recommendationText = recommendation.replace(/_/g, ' ').toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Security Scan</h3>
          <p className="text-gray-400">Vulnerability detection and security analysis</p>
        </div>
        {data.has_critical_issues && (
          <div className="badge bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse-slow">
            ⚠️ CRITICAL ISSUES
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-dark-border"
              />
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {animatedScore}
              </span>
              <span className="text-gray-400 text-sm mt-1">Security Score</span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-center space-y-4">
          <div className={`p-4 rounded-lg border ${getRecommendationColor(recommendation)}`}>
            <p className="text-sm font-medium opacity-75 mb-1">Recommendation</p>
            <p className="text-xl font-bold">{recommendationText}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-bg rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Vulnerabilities</p>
              <p className="text-2xl font-bold text-white">
                {data.vulnerabilities?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-dark-bg rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Critical Issues</p>
              <p className="text-2xl font-bold text-red-500">
                {data.vulnerabilities?.filter(v => v.severity === 'critical').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {data.vulnerabilities && data.vulnerabilities.length > 0 ? (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Vulnerabilities Found ({data.vulnerabilities.length})</span>
          </h4>
          <div className="space-y-4">
            {data.vulnerabilities.map((vuln, index) => (
              <div key={index} className="card border-l-4 border-l-red-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge border ${getSeverityBadge(vuln.severity)}`}>
                        {vuln.severity?.toUpperCase()}
                      </span>
                      <h5 className="text-lg font-semibold text-white">{vuln.type}</h5>
                    </div>
                    <p className="text-sm text-gray-400">
                      <code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {vuln.file}
                      </code>
                      {vuln.line && <span className="ml-2">Line {vuln.line}</span>}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{vuln.description}</p>

                {(vuln.vulnerable_code || vuln.fixed_code) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vuln.vulnerable_code && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-red-400">Vulnerable Code</p>
                          <button
                            onClick={() => copyToClipboard(vuln.vulnerable_code, `vuln-${index}`)}
                            className="p-1 hover:bg-dark-hover rounded transition-colors"
                          >
                            {copiedIndex === `vuln-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-red-500/10 border border-red-500/20 rounded p-3 overflow-x-auto">
                          <code className="text-sm text-gray-300">{vuln.vulnerable_code}</code>
                        </pre>
                      </div>
                    )}

                    {vuln.fixed_code && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-green-400">Fixed Code</p>
                          <button
                            onClick={() => copyToClipboard(vuln.fixed_code, `fix-${index}`)}
                            className="p-1 hover:bg-dark-hover rounded transition-colors"
                          >
                            {copiedIndex === `fix-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-green-500/10 border border-green-500/20 rounded p-3 overflow-x-auto">
                          <code className="text-sm text-gray-300">{vuln.fixed_code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Vulnerabilities Detected</h4>
          <p className="text-gray-400">This PR passed all security checks</p>
        </div>
      )}
    </div>
  )
}

// Made with Bob
