import { useState, useEffect } from 'react'
import { Search, Filter, GitPullRequest, Shield, TestTube, AlertTriangle } from 'lucide-react'
import { getPullRequests, getStats } from '../lib/api'
import PRCard from '../components/PRCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Link from 'next/link'

export default function Dashboard() {
  const [prs, setPrs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [prsData, statsData] = await Promise.all([
        getPullRequests(),
        getStats()
      ])
      setPrs(prsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrs = prs.filter(pr => {
    const matchesSearch = pr.pr_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pr.repository_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === 'all' || pr.risk_level === riskFilter
    return matchesSearch && matchesRisk
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">AI-powered Pull Request intelligence</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card hover:bg-dark-hover transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total PRs</p>
                <p className="text-3xl font-bold text-white">{stats.total_prs}</p>
              </div>
              <GitPullRequest className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="card hover:bg-dark-hover transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Critical PRs</p>
                <p className="text-3xl font-bold text-red-500">{stats.prs_by_risk.critical}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="card hover:bg-dark-hover transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Vulnerabilities</p>
                <p className="text-3xl font-bold text-orange-500">{stats.total_vulnerabilities}</p>
              </div>
              <Shield className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="card hover:bg-dark-hover transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Tests Generated</p>
                <p className="text-3xl font-bold text-green-500">{stats.total_tests_generated}</p>
              </div>
              <TestTube className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search PRs by title or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRiskFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'low'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setRiskFilter('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setRiskFilter('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'high'
                  ? 'bg-orange-600 text-white'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setRiskFilter('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
              }`}
            >
              Critical
            </button>
          </div>
        </div>
      </div>

      {filteredPrs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPrs.map(pr => (
            <PRCard key={pr.id} pr={pr} />
          ))}
        </div>
      ) : prs.length === 0 ? (
        <div className="card text-center py-16">
          <GitPullRequest className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">No Pull Requests Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Connect a GitHub repository to start analyzing pull requests with IBM Bob
          </p>
          <Link href="/setup" className="btn-primary inline-block">
            Connect Repository
          </Link>
        </div>
      ) : (
        <div className="card text-center py-16">
          <Search className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">No Results Found</h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setRiskFilter('all')
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

// Made with Bob
