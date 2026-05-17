import { BookOpen, ChevronDown, ChevronUp, AlertTriangle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function DocsReport({ data }) {
  const [expandedFunctions, setExpandedFunctions] = useState({})
  const [copiedIndex, setCopiedIndex] = useState(null)

  const toggleFunction = (index) => {
    setExpandedFunctions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!data) {
    return <div className="text-gray-400">No documentation available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Documentation</h3>
          <p className="text-gray-400">Auto-generated documentation for changed functions</p>
        </div>
      </div>

      {data.breaking_changes && data.breaking_changes.length > 0 && (
        <div className="card bg-red-500/5 border-red-500/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-400 mb-2">⚠️ Breaking Changes</h4>
              <ul className="space-y-1">
                {data.breaking_changes.map((change, index) => (
                  <li key={index} className="text-gray-300 text-sm">• {change}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {data.outdated_docs && data.outdated_docs.length > 0 && (
        <div className="card bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">📝 Outdated Documentation</h4>
              <ul className="space-y-1">
                {data.outdated_docs.map((doc, index) => (
                  <li key={index} className="text-gray-300 text-sm">• {doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {data.functions && data.functions.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>Functions Documented ({data.functions.length})</span>
          </h4>

          {data.functions.map((func, index) => (
            <div key={index} className="card">
              <button
                onClick={() => toggleFunction(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <code className="text-lg font-semibold text-blue-400">
                      {func.name || 'unnamed'}
                    </code>
                    <span className="text-sm text-gray-500">
                      {func.file || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{func.summary || 'No summary'}</p>
                </div>
                {expandedFunctions[index] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>

              {expandedFunctions[index] && (
                <div className="mt-6 space-y-6 pt-6 border-t border-dark-border">
                  {func.parameters && func.parameters.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-3">Parameters</h5>
                      <div className="space-y-2">
                        {func.parameters.map((param, pIndex) => (
                          <div key={pIndex} className="bg-dark-bg rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <code className="text-blue-400 font-mono text-sm">
                                {param.name}
                              </code>
                              <span className="text-gray-500 text-xs">
                                ({param.type || 'any'})
                              </span>
                              {param.required && (
                                <span className="badge bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                  required
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{param.description || 'No description'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {func.returns && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-3">Returns</h5>
                      <div className="bg-dark-bg rounded-lg p-3">
                        <code className="text-green-400 font-mono text-sm">
                          {func.returns.type || 'void'}
                        </code>
                        <p className="text-gray-400 text-sm mt-1">
                          {func.returns.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  )}

                  {func.throws && func.throws.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-300 mb-3">Throws</h5>
                      <div className="bg-dark-bg rounded-lg p-3">
                        <ul className="space-y-1">
                          {func.throws.map((error, eIndex) => (
                            <li key={eIndex} className="text-red-400 text-sm font-mono">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {func.example && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-gray-300">Example</h5>
                        <button
                          onClick={() => copyToClipboard(func.example, `example-${index}`)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-dark-hover hover:bg-dark-border rounded transition-colors text-sm"
                        >
                          {copiedIndex === `example-${index}` ? (
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
                        <code className="text-sm text-gray-300 font-mono">{func.example}</code>
                      </pre>
                    </div>
                  )}

                  {func.notes && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-400 mb-2">📌 Notes</h5>
                      <p className="text-gray-300 text-sm">{func.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Documentation Generated</h4>
          <p className="text-gray-400">No functions to document in this PR</p>
        </div>
      )}
    </div>
  )
}

// Made with Bob
