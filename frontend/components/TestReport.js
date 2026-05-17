import { TestTube, Copy, Check, CheckCircle, AlertTriangle, XCircle, Lock } from 'lucide-react'
import { useState } from 'react'

export default function TestReport({ data }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!data) {
    return <div className="text-gray-400">No test report available</div>
  }

  const getTestTypeIcon = (type) => {
    switch (type) {
      case 'happy_path':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'edge_case':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error_case':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'security':
        return <Lock className="w-5 h-5 text-purple-500" />
      default:
        return <TestTube className="w-5 h-5 text-blue-500" />
    }
  }

  const getTestTypeBadge = (type) => {
    const badges = {
      happy_path: 'bg-green-500/10 text-green-500 border-green-500/20',
      edge_case: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      error_case: 'bg-red-500/10 text-red-500 border-red-500/20',
      security: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
    return badges[type] || 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }

  const getCoverageColor = (coverage) => {
    const percent = parseInt(coverage)
    if (percent >= 80) return 'text-green-500'
    if (percent >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Test Report</h3>
          <p className="text-gray-400">Auto-generated test cases for this PR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Framework</p>
          <p className="text-xl font-bold text-white">{data.framework || 'Unknown'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Coverage Estimate</p>
          <p className={`text-xl font-bold ${getCoverageColor(data.coverage_estimate || '0%')}`}>
            {data.coverage_estimate || '0%'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Test Cases</p>
          <p className="text-xl font-bold text-white">{data.cases?.length || 0}</p>
        </div>
      </div>

      {data.test_file_path && (
        <div className="card bg-blue-500/5 border-blue-500/20">
          <p className="text-sm text-gray-400 mb-2">Suggested Test File Path</p>
          <code className="text-blue-400 text-sm">{data.test_file_path}</code>
        </div>
      )}

      {data.cases && data.cases.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-blue-500" />
            <span>Generated Test Cases ({data.cases.length})</span>
          </h4>

          {data.cases.map((testCase, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  {getTestTypeIcon(testCase.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="text-lg font-semibold text-white">
                        {testCase.test_name || 'Unnamed Test'}
                      </h5>
                      <span className={`badge border ${getTestTypeBadge(testCase.type)}`}>
                        {testCase.type?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Tests: <code className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {testCase.function_tested || 'N/A'}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-300">Test Code</p>
                  <button
                    onClick={() => copyToClipboard(testCase.code, index)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-dark-hover hover:bg-dark-border rounded transition-colors text-sm"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-dark-bg border border-dark-border rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono">
                    {testCase.code || '# No code provided'}
                  </code>
                </pre>
              </div>

              {testCase.why_it_matters && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-400 mb-2 flex items-center space-x-2">
                    <span>💡</span>
                    <span>Why It Matters</span>
                  </p>
                  <p className="text-gray-300 text-sm">{testCase.why_it_matters}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <TestTube className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Test Cases Generated</h4>
          <p className="text-gray-400">Unable to generate tests for this PR</p>
        </div>
      )}
    </div>
  )
}

// Made with Bob
