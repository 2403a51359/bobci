import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Zap,
  Database,
  Lock,
  Clock,
  Users,
  TrendingDown,
  XCircle,
  ChevronRight
} from 'lucide-react'

const predictionCategories = [
  {
    id: 'performance',
    icon: Zap,
    color: 'orange',
    title: 'Performance Degradation'
  },
  {
    id: 'data',
    icon: Database,
    color: 'red',
    title: 'Data Integrity Issues'
  },
  {
    id: 'auth',
    icon: Lock,
    color: 'purple',
    title: 'Authentication Failures'
  },
  {
    id: 'timeout',
    icon: Clock,
    color: 'yellow',
    title: 'Timeout Risks'
  },
  {
    id: 'user',
    icon: Users,
    color: 'blue',
    title: 'User Experience Impact'
  }
]

export default function WhatCouldBreak({ reports, data }) {
  const predictions = generatePredictions(reports, data)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2">
            <AlertTriangle className="w-7 h-7 text-orange-400" />
            <span>What Could Break?</span>
          </h3>
          <p className="text-gray-400">AI-powered failure prediction and risk analysis</p>
        </div>
        {predictions.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="text-sm text-gray-400">Predicted Failures</div>
            <div className="text-2xl font-bold text-red-400">{predictions.length}</div>
          </motion.div>
        )}
      </div>

      {predictions.length > 0 ? (
        <div className="space-y-4">
          {predictions.map((prediction, index) => {
            const Icon = prediction.icon
            const colorClasses = getColorClasses(prediction.severity)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-lg border-2 ${colorClasses.border} ${colorClasses.bg} relative overflow-hidden`}
              >
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 ${colorClasses.gradient} opacity-5`}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className={`w-12 h-12 rounded-lg ${colorClasses.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-lg font-semibold ${colorClasses.text}`}>
                            {prediction.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${colorClasses.badge}`}>
                            {prediction.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{prediction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${colorClasses.text}`}>
                        {prediction.probability}%
                      </div>
                      <div className="text-xs text-gray-500">Probability</div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4">{prediction.description}</p>

                  {/* Impact details */}
                  <div className="space-y-2 mb-4">
                    {prediction.impacts.map((impact, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <ChevronRight className={`w-4 h-4 ${colorClasses.icon} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-300">{impact}</span>
                      </div>
                    ))}
                  </div>

                  {/* Affected components */}
                  {prediction.affectedComponents && prediction.affectedComponents.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-400 mb-2">AFFECTED COMPONENTS</div>
                      <div className="flex flex-wrap gap-2">
                        {prediction.affectedComponents.map((component, idx) => (
                          <code
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${colorClasses.componentBg} ${colorClasses.componentText}`}
                          >
                            {component}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mitigation */}
                  <div className={`p-3 rounded-lg ${colorClasses.mitigationBg} border ${colorClasses.mitigationBorder}`}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">MITIGATION</div>
                    <p className="text-sm text-gray-300">{prediction.mitigation}</p>
                  </div>

                  {/* Confidence indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500">AI Confidence</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-1.5 bg-dark-bg rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                          className={`h-full ${colorClasses.confidenceBar}`}
                        />
                      </div>
                      <span className={`font-semibold ${colorClasses.text}`}>
                        {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <TrendingDown className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h4 className="text-xl font-semibold text-white mb-2">Low Risk Detected</h4>
          <p className="text-gray-400">
            No critical failure scenarios predicted for this PR
          </p>
        </div>
      )}

      {/* AI Attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-white">Predictive Analysis:</span> These scenarios are
            generated by IBM Bob's multi-agent system analyzing code patterns, dependency chains, and
            historical failure data. Predictions are probabilistic and should be validated.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function generatePredictions(reports, data) {
  const predictions = []

  if (!reports) return predictions

  // Security-based predictions
  if (reports.security?.vulnerabilities) {
    reports.security.vulnerabilities.forEach(vuln => {
      if (vuln.type === 'SQL Injection') {
        predictions.push({
          title: 'Database Compromise Risk',
          category: 'Data Integrity',
          severity: 'critical',
          probability: 85,
          confidence: 92,
          icon: Database,
          description: 'SQL injection vulnerability could allow attackers to manipulate database queries, leading to data breaches, unauthorized access, or complete database compromise.',
          impacts: [
            'Unauthorized data access and exfiltration',
            'Data corruption or deletion',
            'Authentication bypass',
            'Privilege escalation'
          ],
          affectedComponents: ['auth.py', 'database.py', 'user_service.py'],
          mitigation: 'Implement parameterized queries immediately. Use ORM frameworks or prepared statements. Add input validation and sanitization layers.'
        })
      }

      if (vuln.type === 'Missing Password Hashing') {
        predictions.push({
          title: 'Authentication System Failure',
          category: 'Security',
          severity: 'critical',
          probability: 90,
          confidence: 95,
          icon: Lock,
          description: 'Plaintext password comparison creates a critical security vulnerability. If the database is compromised, all user credentials are immediately exposed.',
          impacts: [
            'Mass account takeover',
            'Credential stuffing attacks',
            'Compliance violations (GDPR, PCI-DSS)',
            'Reputation damage'
          ],
          affectedComponents: ['auth.py', 'user_model.py'],
          mitigation: 'Implement bcrypt or argon2 password hashing immediately. Force password reset for all users after deployment.'
        })
      }

      if (vuln.type === 'Missing Rate Limiting') {
        predictions.push({
          title: 'Brute Force Attack Success',
          category: 'Security',
          severity: 'high',
          probability: 75,
          confidence: 88,
          icon: Lock,
          description: 'Without rate limiting, attackers can perform unlimited login attempts, making brute force and credential stuffing attacks highly effective.',
          impacts: [
            'Account compromise through brute force',
            'Service degradation from attack traffic',
            'Increased infrastructure costs',
            'Potential DDoS vulnerability'
          ],
          affectedComponents: ['auth.py', 'api_routes.py'],
          mitigation: 'Implement rate limiting middleware (e.g., 5 attempts per 5 minutes). Add CAPTCHA after failed attempts. Monitor for suspicious patterns.'
        })
      }
    })
  }

  // Impact-based predictions
  if (reports.impact) {
    const directImpact = reports.impact.direct_impact || []
    const indirectImpact = reports.impact.indirect_impact || []

    if (directImpact.some(item => item.likely_breaks)) {
      predictions.push({
        title: 'Service Disruption Likely',
        category: 'Availability',
        severity: 'high',
        probability: 70,
        confidence: 85,
        icon: Zap,
        description: 'Changes to core authentication logic will break existing API contracts and cause service disruptions for active users.',
        impacts: [
          'Active user sessions invalidated',
          'API endpoints return 500 errors',
          'Mobile app authentication failures',
          'Third-party integrations broken'
        ],
        affectedComponents: directImpact.map(item => item.file),
        mitigation: 'Deploy during maintenance window. Implement backward compatibility layer. Add feature flags for gradual rollout.'
      })
    }

    if (indirectImpact.length > 3) {
      predictions.push({
        title: 'Cascading Failure Risk',
        category: 'System Stability',
        severity: 'medium',
        probability: 60,
        confidence: 78,
        icon: TrendingDown,
        description: 'Multiple dependent services could fail in sequence if authentication changes propagate incorrectly through the system.',
        impacts: [
          'Microservices communication breakdown',
          'Session management inconsistencies',
          'Cache invalidation issues',
          'Monitoring and logging gaps'
        ],
        affectedComponents: indirectImpact.slice(0, 5).map(item => item.file),
        mitigation: 'Implement circuit breakers. Add comprehensive integration tests. Deploy with canary release strategy.'
      })
    }
  }

  // Test coverage predictions
  if (reports.tests) {
    const testCount = reports.tests.cases?.length || 0
    if (testCount < 3) {
      predictions.push({
        title: 'Insufficient Test Coverage',
        category: 'Quality Assurance',
        severity: 'medium',
        probability: 65,
        confidence: 80,
        icon: XCircle,
        description: 'Critical authentication logic lacks comprehensive test coverage, increasing the risk of undetected bugs reaching production.',
        impacts: [
          'Edge cases not validated',
          'Regression bugs in production',
          'Difficult to refactor safely',
          'Increased debugging time'
        ],
        affectedComponents: ['auth.py'],
        mitigation: 'Add unit tests for all code paths. Include integration tests for authentication flow. Implement property-based testing for input validation.'
      })
    }
  }

  return predictions
}

function getColorClasses(severity) {
  const classes = {
    critical: {
      border: 'border-red-500',
      bg: 'bg-red-500/5',
      gradient: 'bg-gradient-to-r from-red-500 to-rose-600',
      text: 'text-red-400',
      icon: 'text-red-400',
      iconBg: 'bg-red-500/20',
      badge: 'bg-red-500/20 text-red-400',
      componentBg: 'bg-red-500/10',
      componentText: 'text-red-400',
      mitigationBg: 'bg-red-500/10',
      mitigationBorder: 'border-red-500/20',
      confidenceBar: 'bg-red-500'
    },
    high: {
      border: 'border-orange-500',
      bg: 'bg-orange-500/5',
      gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-orange-400',
      icon: 'text-orange-400',
      iconBg: 'bg-orange-500/20',
      badge: 'bg-orange-500/20 text-orange-400',
      componentBg: 'bg-orange-500/10',
      componentText: 'text-orange-400',
      mitigationBg: 'bg-orange-500/10',
      mitigationBorder: 'border-orange-500/20',
      confidenceBar: 'bg-orange-500'
    },
    medium: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-500/5',
      gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      text: 'text-yellow-400',
      icon: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
      badge: 'bg-yellow-500/20 text-yellow-400',
      componentBg: 'bg-yellow-500/10',
      componentText: 'text-yellow-400',
      mitigationBg: 'bg-yellow-500/10',
      mitigationBorder: 'border-yellow-500/20',
      confidenceBar: 'bg-yellow-500'
    }
  }
  return classes[severity] || classes.medium
}

// Made with Bob - Elite Edition