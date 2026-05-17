import { motion } from 'framer-motion'
import { AlertTriangle, FileCode, Shield, TrendingUp } from 'lucide-react'

export default function RiskHeatmap({ reports, data }) {
  const heatmapData = generateHeatmapData(reports)

  const getRiskColor = (risk) => {
    if (risk >= 80) return 'bg-red-500'
    if (risk >= 60) return 'bg-orange-500'
    if (risk >= 40) return 'bg-yellow-500'
    if (risk >= 20) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRiskLabel = (risk) => {
    if (risk >= 80) return 'Critical'
    if (risk >= 60) return 'High'
    if (risk >= 40) return 'Medium'
    if (risk >= 20) return 'Low'
    return 'Safe'
  }

  const maxRisk = Math.max(...heatmapData.map(item => item.risk), 1)

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
            <Shield className="w-7 h-7 text-orange-400" />
            <span>Risk Heatmap</span>
          </h3>
          <p className="text-gray-400">File-level vulnerability and risk distribution</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-gray-300">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-gray-300">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-gray-300">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-300">Safe</span>
          </div>
        </div>
      </div>

      {heatmapData.length > 0 ? (
        <div className="space-y-3">
          {heatmapData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <FileCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-blue-400 truncate">
                      {item.file}
                    </code>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        item.risk >= 80 ? 'bg-red-500/20 text-red-400' :
                        item.risk >= 60 ? 'bg-orange-500/20 text-orange-400' :
                        item.risk >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {getRiskLabel(item.risk)}
                      </span>
                      <span className="text-sm font-bold text-white w-12 text-right">
                        {item.risk}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk bar */}
              <div className="relative h-8 bg-dark-bg rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.risk / maxRisk) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                  className={`absolute inset-y-0 left-0 ${getRiskColor(item.risk)} opacity-80`}
                />
                
                {/* Hover details */}
                <div className="absolute inset-0 flex items-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-4 text-xs text-white font-medium">
                    {item.vulnerabilities > 0 && (
                      <span className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{item.vulnerabilities} vuln{item.vulnerabilities !== 1 ? 's' : ''}</span>
                      </span>
                    )}
                    {item.issues > 0 && (
                      <span>{item.issues} issue{item.issues !== 1 ? 's' : ''}</span>
                    )}
                    {item.changes > 0 && (
                      <span>{item.changes} change{item.changes !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Issue details */}
              {item.details && item.details.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="mt-2 ml-7 space-y-1"
                >
                  {item.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-gray-400">
                      <span className="text-orange-400">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h4 className="text-xl font-semibold text-white mb-2">All Clear</h4>
          <p className="text-gray-400">No high-risk files detected in this PR</p>
        </div>
      )}

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="text-2xl font-bold text-red-400">
            {heatmapData.filter(item => item.risk >= 80).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Critical Files</div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="text-2xl font-bold text-orange-400">
            {heatmapData.filter(item => item.risk >= 60 && item.risk < 80).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">High Risk Files</div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="text-2xl font-bold text-yellow-400">
            {heatmapData.filter(item => item.risk >= 40 && item.risk < 60).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Medium Risk Files</div>
        </div>
        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="text-2xl font-bold text-green-400">
            {heatmapData.filter(item => item.risk < 40).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Low Risk Files</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function generateHeatmapData(reports) {
  const heatmap = []
  const fileRisks = new Map()

  if (!reports) return heatmap

  // Aggregate risk from security vulnerabilities
  if (reports.security?.vulnerabilities) {
    reports.security.vulnerabilities.forEach(vuln => {
      const file = vuln.file
      if (!file) return

      const existing = fileRisks.get(file) || {
        file,
        risk: 0,
        vulnerabilities: 0,
        issues: 0,
        changes: 0,
        details: []
      }

      const severityScore = {
        critical: 30,
        high: 20,
        medium: 10,
        low: 5
      }[vuln.severity?.toLowerCase()] || 10

      existing.risk += severityScore
      existing.vulnerabilities += 1
      existing.details.push(`${vuln.severity} - ${vuln.type}`)
      fileRisks.set(file, existing)
    })
  }

  // Add risk from direct impact
  if (reports.impact?.direct_impact) {
    reports.impact.direct_impact.forEach(item => {
      const file = item.file
      if (!file) return

      const existing = fileRisks.get(file) || {
        file,
        risk: 0,
        vulnerabilities: 0,
        issues: 0,
        changes: 0,
        details: []
      }

      if (item.likely_breaks) {
        existing.risk += 25
        existing.issues += 1
        existing.details.push('Breaking change detected')
      } else {
        existing.risk += 10
        existing.changes += 1
      }

      fileRisks.set(file, existing)
    })
  }

  // Add risk from indirect impact
  if (reports.impact?.indirect_impact) {
    reports.impact.indirect_impact.forEach(item => {
      const file = item.file
      if (!file) return

      const existing = fileRisks.get(file) || {
        file,
        risk: 0,
        vulnerabilities: 0,
        issues: 0,
        changes: 0,
        details: []
      }

      existing.risk += 5
      existing.changes += 1
      fileRisks.set(file, existing)
    })
  }

  // Convert to array and cap risk at 100
  fileRisks.forEach(item => {
    heatmap.push({
      ...item,
      risk: Math.min(100, item.risk)
    })
  })

  // Sort by risk (highest first)
  heatmap.sort((a, b) => b.risk - a.risk)

  return heatmap
}

// Made with Bob - Elite Edition