import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, ExternalLink, GitBranch, User, Clock, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { getPullRequest } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import RiskBadge from '../../components/RiskBadge'
import MergeSafetyScore from '../../components/MergeSafetyScore'
import ImpactRadiusVisualization from '../../components/ImpactRadiusVisualization'
import AIAnalysisTimeline from '../../components/AIAnalysisTimeline'
import WhatCouldBreak from '../../components/WhatCouldBreak'
import RiskHeatmap from '../../components/RiskHeatmap'
import GitHubCommentSimulation from '../../components/GitHubCommentSimulation'
import ImpactReport from '../../components/ImpactReport'
import SecurityReport from '../../components/SecurityReport'
import TestReport from '../../components/TestReport'
import DocsReport from '../../components/DocsReport'
import JuniorGuide from '../../components/JuniorGuide'

export default function PRDetail() {
  const router = useRouter()
  const { id } = router.query
  const [pr, setPr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      loadPR()
      const interval = setInterval(() => {
        if (pr?.status === 'analyzing') {
          loadPR()
        }
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [id, pr?.status])

  const loadPR = async () => {
    try {
      const data = await getPullRequest(id)
      setPr(data)
      setError(null)
    } catch (err) {
      setError('Failed to load pull request')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="xl" text="Loading pull request..." />
      </div>
    )
  }

  if (error || !pr) {
    return (
      <div className="card text-center py-16">
        <h3 className="text-2xl font-bold text-white mb-3">Pull Request Not Found</h3>
        <p className="text-gray-400 mb-6">{error || 'The requested PR does not exist'}</p>
        <Link href="/" className="btn-primary inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'impact_radius', label: 'Impact Radius', icon: '🎯' },
    { id: 'predictions', label: 'What Could Break?', icon: '⚠️' },
    { id: 'heatmap', label: 'Risk Heatmap', icon: '🔥' },
    { id: 'github_comments', label: 'GitHub Comments', icon: '💬' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'tests', label: 'Tests', icon: '🧪' },
    { id: 'documentation', label: 'Docs', icon: '📚' },
    { id: 'junior_guide', label: 'Junior Guide', icon: '🎓' }
  ]

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const timeAgo = formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{pr.pr_title}</h1>
                <RiskBadge level={pr.risk_level} />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>#{pr.pr_number}</span>
                <span>•</span>
                <span>{pr.repository_name}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgo}</span>
                </span>
              </div>
            </div>
            <a
              href={pr.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                {getInitials(pr.pr_author)}
              </div>
              <div>
                <p className="text-gray-400">Author</p>
                <p className="text-white font-medium">{pr.pr_author}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-dark-border" />

            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400">Branches</p>
                <p className="text-white font-medium">
                  {pr.head_branch} → {pr.base_branch}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-dark-border" />

            <div>
              <p className="text-gray-400">Status</p>
              <div className="flex items-center space-x-2">
                {pr.status === 'analyzing' && (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-blue-500 font-medium">Analyzing...</span>
                  </>
                )}
                {pr.status === 'complete' && (
                  <span className="text-green-500 font-medium">✓ Complete</span>
                )}
                {pr.status === 'failed' && (
                  <span className="text-red-500 font-medium">✗ Failed</span>
                )}
                {pr.status === 'pending' && (
                  <span className="text-gray-500 font-medium">⏳ Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {pr.status === 'analyzing' ? (
        <AIAnalysisTimeline status="analyzing" />
      ) : pr.status === 'failed' ? (
        <div className="card text-center py-16 bg-red-500/5 border-red-500/20">
          <h3 className="text-2xl font-bold text-red-400 mb-3">Analysis Failed</h3>
          <p className="text-gray-400 mb-6">
            IBM Bob encountered an error while analyzing this PR
          </p>
          <button onClick={loadPR} className="btn-primary">
            Retry
          </button>
        </div>
      ) : pr.status === 'pending' ? (
        <div className="card text-center py-16">
          <Clock className="w-16 h-16 text-gray-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Analysis Pending</h3>
          <p className="text-gray-400">
            This PR is queued for analysis
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-dark-bg text-gray-400 hover:bg-dark-hover hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <MergeSafetyScore data={pr} reports={pr.reports} />
                <AIAnalysisTimeline status="complete" />
              </>
            )}
            {activeTab === 'impact_radius' && (
              <>
                <ImpactRadiusVisualization data={pr} reports={pr.reports} />
                <ImpactReport data={pr.reports?.impact} />
              </>
            )}
            {activeTab === 'predictions' && (
              <WhatCouldBreak data={pr} reports={pr.reports} />
            )}
            {activeTab === 'heatmap' && (
              <RiskHeatmap data={pr} reports={pr.reports} />
            )}
            {activeTab === 'github_comments' && (
              <GitHubCommentSimulation data={pr} reports={pr.reports} />
            )}
            {activeTab === 'security' && (
              <SecurityReport data={pr.reports?.security} />
            )}
            {activeTab === 'tests' && (
              <TestReport data={pr.reports?.tests} />
            )}
            {activeTab === 'documentation' && (
              <DocsReport data={pr.reports?.documentation} />
            )}
            {activeTab === 'junior_guide' && (
              <JuniorGuide data={pr.reports?.junior_guide} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Made with Bob - Elite Edition
