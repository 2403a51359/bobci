import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'

export default function MergeSafetyScore({ data, reports }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate comprehensive merge safety score
  const calculateScore = () => {
    if (!reports) return 50

    let score = 100
    const weights = {
      security: 0.35,
      impact: 0.25,
      tests: 0.20,
      documentation: 0.10,
      confidence: 0.10
    }

    // Security impact
    if (reports.security) {
      const securityScore = reports.security.overall_score || 50
      score -= (100 - securityScore) * weights.security
      
      if (reports.security.has_critical_issues) {
        score -= 25
      }
    }

    // Impact analysis
    if (reports.impact) {
      const directImpact = reports.impact.direct_impact?.length || 0
      const indirectImpact = reports.impact.indirect_impact?.length || 0
      
      if (reports.impact.recommendation === 'block') {
        score -= 30
      } else if (reports.impact.recommendation === 'request_changes') {
        score -= 15
      }
      
      score -= Math.min(directImpact * 3, 20)
      score -= Math.min(indirectImpact * 1.5, 10)
    }

    // Test coverage
    if (reports.tests) {
      const testCount = reports.tests.cases?.length || 0
      if (testCount === 0) {
        score -= 20
      } else if (testCount < 3) {
        score -= 10
      }
    }

    // Documentation
    if (reports.documentation) {
      const docCount = reports.documentation.functions?.length || 0
      if (docCount === 0) {
        score -= 10
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  const score = calculateScore()

  useEffect(() => {
    const duration = 2000
    const steps = 100
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreLevel = (score) => {
    if (score >= 85) return { level: 'SAFE', color: 'green', icon: CheckCircle }
    if (score >= 70) return { level: 'GOOD', color: 'blue', icon: TrendingUp }
    if (score >= 50) return { level: 'RISKY', color: 'yellow', icon: AlertTriangle }
    if (score >= 30) return { level: 'CRITICAL', color: 'orange', icon: AlertTriangle }
    return { level: 'DANGEROUS', color: 'red', icon: XCircle }
  }

  const scoreInfo = getScoreLevel(score)
  const Icon = scoreInfo.icon

  const getGradient = (color) => {
    const gradients = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      yellow: 'from-yellow-500 to-orange-500',
      orange: 'from-orange-500 to-red-500',
      red: 'from-red-500 to-rose-700'
    }
    return gradients[color]
  }

  const getGlowColor = (color) => {
    const glows = {
      green: 'shadow-green-500/50',
      blue: 'shadow-blue-500/50',
      yellow: 'shadow-yellow-500/50',
      orange: 'shadow-orange-500/50',
      red: 'shadow-red-500/50'
    }
    return glows[color]
  }

  const getTextColor = (color) => {
    const colors = {
      green: 'text-green-400',
      blue: 'text-blue-400',
      yellow: 'text-yellow-400',
      orange: 'text-orange-400',
      red: 'text-red-400'
    }
    return colors[color]
  }

  const getRingColor = (color) => {
    const rings = {
      green: 'stroke-green-500',
      blue: 'stroke-blue-500',
      yellow: 'stroke-yellow-500',
      orange: 'stroke-orange-500',
      red: 'stroke-red-500'
    }
    return rings[color]
  }

  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const factors = []
  if (reports?.security) {
    factors.push({
      name: 'Security',
      score: reports.security.overall_score || 50,
      weight: 35,
      issues: reports.security.vulnerabilities?.length || 0
    })
  }
  if (reports?.impact) {
    const impactScore = reports.impact.recommendation === 'approve' ? 90 : 
                       reports.impact.recommendation === 'request_changes' ? 60 : 30
    factors.push({
      name: 'Impact',
      score: impactScore,
      weight: 25,
      issues: (reports.impact.direct_impact?.length || 0) + (reports.impact.indirect_impact?.length || 0)
    })
  }
  if (reports?.tests) {
    const testScore = Math.min(100, (reports.tests.cases?.length || 0) * 25)
    factors.push({
      name: 'Tests',
      score: testScore,
      weight: 20,
      issues: testScore < 75 ? 1 : 0
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(scoreInfo.color)} opacity-5`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Merge Safety Score</h3>
            <p className="text-gray-400">AI-powered risk assessment</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Shield className={`w-8 h-8 ${getTextColor(scoreInfo.color)}`} />
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Main Score Circle */}
          <div className="relative flex-shrink-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <svg className="transform -rotate-90 w-64 h-64">
                {/* Background circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-dark-border"
                />
                {/* Animated progress circle */}
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`${getRingColor(scoreInfo.color)} transition-all duration-2000 ease-out drop-shadow-lg`}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                  className={`text-7xl font-black ${getTextColor(scoreInfo.color)} mb-2`}
                >
                  {animatedScore}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-gray-400 text-sm font-medium"
                >
                  / 100
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className={`mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r ${getGradient(scoreInfo.color)} text-white font-bold text-sm shadow-lg ${getGlowColor(scoreInfo.color)}`}
                >
                  {scoreInfo.level}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Score Breakdown */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Risk Factors</h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {factors.map((factor, index) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 font-medium">{factor.name}</span>
                    <span className="text-gray-500">({factor.weight}%)</span>
                    {factor.issues > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                        {factor.issues} {factor.issues === 1 ? 'issue' : 'issues'}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${factor.score >= 80 ? 'text-green-400' : factor.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {factor.score}%
                  </span>
                </div>
                <div className="relative h-2 bg-dark-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                      factor.score >= 80 ? 'from-green-500 to-emerald-600' :
                      factor.score >= 60 ? 'from-yellow-500 to-orange-500' :
                      'from-orange-500 to-red-600'
                    } rounded-full`}
                  />
                </div>
              </motion.div>
            ))}

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-dark-bg rounded-lg border border-dark-border"
              >
                <h5 className="text-sm font-semibold text-white mb-3">Recommendation</h5>
                <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                  score >= 85 ? 'bg-green-500/10 border border-green-500/20' :
                  score >= 70 ? 'bg-blue-500/10 border border-blue-500/20' :
                  score >= 50 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getTextColor(scoreInfo.color)}`} />
                  <div className="text-sm text-gray-300">
                    {score >= 85 && "This PR is safe to merge. All checks passed with minimal risk."}
                    {score >= 70 && score < 85 && "This PR looks good but has minor concerns. Review recommended before merging."}
                    {score >= 50 && score < 70 && "This PR has moderate risks. Address issues before merging."}
                    {score >= 30 && score < 50 && "This PR has critical issues. Significant changes required before merging."}
                    {score < 30 && "This PR is dangerous to merge. Block until all critical issues are resolved."}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Made with Bob - Elite Edition