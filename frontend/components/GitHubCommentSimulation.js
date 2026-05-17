import { motion } from 'framer-motion'
import { MessageSquare, Bot, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function GitHubCommentSimulation({ reports, data }) {
  const comments = generateComments(reports, data)

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
            <MessageSquare className="w-7 h-7 text-blue-400" />
            <span>GitHub PR Comments</span>
          </h3>
          <p className="text-gray-400">AI-generated review comments preview</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-gray-400">Comments</div>
          <div className="text-2xl font-bold text-blue-400">{comments.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-bg rounded-lg border border-dark-border overflow-hidden"
          >
            {/* Comment Header */}
            <div className="flex items-center space-x-3 p-4 border-b border-dark-border bg-dark-card">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">BobCI Bot</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                    BOT
                  </span>
                  <span className="text-gray-500 text-sm">commented just now</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Powered by IBM Bob + watsonx.ai
                </div>
              </div>
              {comment.icon}
            </div>

            {/* Comment Body */}
            <div className="p-4">
              {comment.file && (
                <div className="mb-3 p-2 bg-dark-card rounded border border-dark-border">
                  <code className="text-sm text-blue-400">{comment.file}</code>
                  {comment.line && (
                    <span className="text-gray-500 text-sm ml-2">Line {comment.line}</span>
                  )}
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-3">{comment.message}</p>
              </div>

              {comment.code && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-400 mb-2">
                    {comment.codeLabel || 'CODE'}
                  </div>
                  <pre className={`p-3 rounded overflow-x-auto text-sm ${comment.codeClass}`}>
                    <code>{comment.code}</code>
                  </pre>
                </div>
              )}

              {comment.suggestion && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-green-400 mb-2">
                    ✓ SUGGESTED FIX
                  </div>
                  <pre className="bg-green-500/10 border border-green-500/20 p-3 rounded overflow-x-auto text-sm">
                    <code className="text-gray-300">{comment.suggestion}</code>
                  </pre>
                </div>
              )}

              {comment.actions && comment.actions.length > 0 && (
                <div className="mt-4 flex items-center space-x-2">
                  {comment.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1.5 bg-dark-card hover:bg-dark-hover border border-dark-border rounded text-sm text-gray-300 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Footer */}
            <div className="px-4 py-2 bg-dark-card border-t border-dark-border flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <button className="hover:text-blue-400 transition-colors">Reply</button>
                <button className="hover:text-blue-400 transition-colors">React</button>
              </div>
              <div className="flex items-center space-x-2">
                <span>AI Confidence:</span>
                <span className="font-semibold text-white">{comment.confidence}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border"
      >
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-white">Preview Mode:</span> These comments show
            how BobCI would appear on your GitHub PR. In production, these are automatically
            posted when analysis completes.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function generateComments(reports, data) {
  const comments = []

  if (!reports) return comments

  // Security comment
  if (reports.security?.vulnerabilities && reports.security.vulnerabilities.length > 0) {
    const critical = reports.security.vulnerabilities.filter(v => v.severity === 'critical')
    
    if (critical.length > 0) {
      const vuln = critical[0]
      comments.push({
        icon: <XCircle className="w-5 h-5 text-red-400" />,
        file: vuln.file,
        line: vuln.line,
        message: `🚨 **Critical Security Vulnerability Detected: ${vuln.type}**\n\n${vuln.description}`,
        code: vuln.vulnerable_code,
        codeLabel: '⚠️ VULNERABLE CODE',
        codeClass: 'bg-red-500/10 border border-red-500/20 text-gray-300',
        suggestion: vuln.fixed_code,
        confidence: 95,
        actions: ['Apply Fix', 'Dismiss', 'Learn More']
      })
    }
  }

  // Impact comment
  if (reports.impact?.direct_impact && reports.impact.direct_impact.length > 0) {
    const breaking = reports.impact.direct_impact.filter(item => item.likely_breaks)
    
    if (breaking.length > 0) {
      comments.push({
        icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
        file: breaking[0].file,
        message: `⚠️ **Breaking Change Detected**\n\nThis change will likely break existing functionality:\n\n${breaking[0].reason}\n\n**Affected Services:** ${breaking.length} file(s)\n**Recommendation:** Add backward compatibility or coordinate deployment.`,
        confidence: 88,
        actions: ['View Impact Graph', 'Acknowledge']
      })
    }
  }

  // Test coverage comment
  if (reports.tests?.cases && reports.tests.cases.length > 0) {
    const testCase = reports.tests.cases[0]
    comments.push({
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      message: `✅ **Test Suite Generated**\n\nI've generated ${reports.tests.cases.length} test cases for this PR:\n\n- ${reports.tests.cases.length} comprehensive tests\n- Coverage: ${reports.tests.coverage_estimate || '90%'}\n- Framework: ${reports.tests.framework || 'pytest'}\n\nTests cover happy paths, edge cases, and security scenarios.`,
      code: testCase.code,
      codeLabel: '🧪 EXAMPLE TEST',
      codeClass: 'bg-green-500/10 border border-green-500/20 text-gray-300',
      confidence: 92,
      actions: ['View All Tests', 'Copy to Clipboard']
    })
  }

  // Documentation comment
  if (reports.documentation?.functions && reports.documentation.functions.length > 0) {
    const func = reports.documentation.functions[0]
    comments.push({
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
      file: func.file,
      message: `📚 **Documentation Generated**\n\nI've created comprehensive documentation for ${reports.documentation.functions.length} function(s).\n\n**${func.name}**\n${func.summary}`,
      code: func.example,
      codeLabel: '📖 USAGE EXAMPLE',
      codeClass: 'bg-blue-500/10 border border-blue-500/20 text-gray-300',
      confidence: 90,
      actions: ['View Full Docs', 'Export']
    })
  }

  // Summary comment
  if (comments.length > 0) {
    const score = calculateOverallScore(reports)
    comments.unshift({
      icon: score >= 80 ? <CheckCircle className="w-5 h-5 text-green-400" /> : 
            score >= 60 ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
            <XCircle className="w-5 h-5 text-red-400" />,
      message: `## 🤖 BobCI Analysis Complete\n\n**Merge Safety Score:** ${score}/100 ${score >= 80 ? '✅' : score >= 60 ? '⚠️' : '🚫'}\n\n**Summary:**\n- Security: ${reports.security?.vulnerabilities?.length || 0} vulnerabilities found\n- Impact: ${(reports.impact?.direct_impact?.length || 0) + (reports.impact?.indirect_impact?.length || 0)} files affected\n- Tests: ${reports.tests?.cases?.length || 0} test cases generated\n- Documentation: ${reports.documentation?.functions?.length || 0} functions documented\n\n${score >= 80 ? '✅ **Safe to merge** - All checks passed' : score >= 60 ? '⚠️ **Review recommended** - Minor issues detected' : '🚫 **Do not merge** - Critical issues must be resolved'}`,
      confidence: 94,
      actions: ['View Dashboard', 'Approve', 'Request Changes']
    })
  }

  return comments
}

function calculateOverallScore(reports) {
  let score = 100
  
  if (reports.security) {
    const vulns = reports.security.vulnerabilities || []
    score -= vulns.filter(v => v.severity === 'critical').length * 25
    score -= vulns.filter(v => v.severity === 'high').length * 15
    score -= vulns.filter(v => v.severity === 'medium').length * 5
  }
  
  if (reports.impact) {
    const breaking = reports.impact.direct_impact?.filter(i => i.likely_breaks).length || 0
    score -= breaking * 10
  }
  
  return Math.max(0, Math.min(100, score))
}

// Made with Bob - Elite Edition