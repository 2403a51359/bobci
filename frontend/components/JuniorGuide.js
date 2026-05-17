import { GraduationCap, Lightbulb, FileCode, BookOpen, ExternalLink } from 'lucide-react'

export default function JuniorGuide({ data }) {
  if (!data) {
    return <div className="text-gray-400">No junior guide available</div>
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return '🟢'
      case 'intermediate':
        return '🟡'
      case 'advanced':
        return '🔴'
      default:
        return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Junior Developer Guide</h3>
          <p className="text-gray-400">Understanding this PR in simple terms</p>
        </div>
        <span className={`badge border ${getDifficultyColor(data.difficulty)}`}>
          {getDifficultyEmoji(data.difficulty)} {data.difficulty?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start space-x-3">
          <GraduationCap className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-3">What Problem Does This Solve?</h4>
            <p className="text-gray-300 leading-relaxed">
              {data.problem_solved || 'No problem description available'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-3">How Does It Work?</h4>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {data.solution_explained || 'No solution explanation available'}
            </div>
          </div>
        </div>
      </div>

      {data.changed_files && data.changed_files.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-purple-500" />
            <span>Changed Files</span>
          </h4>
          <div className="space-y-3">
            {data.changed_files.map((file, index) => (
              <div key={index} className="card bg-dark-bg">
                <div className="mb-2">
                  <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                    {file.file || 'Unknown file'}
                  </code>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-400">Role: </span>
                  <span className="text-sm text-white">{file.role || 'N/A'}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {file.changes_explained || 'No explanation available'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.new_concepts && data.new_concepts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>New Concepts to Learn</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.new_concepts.map((concept, index) => (
              <div key={index} className="card bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💡</span>
                  </div>
                  <h5 className="text-lg font-semibold text-white flex-1">
                    {concept.concept || 'Unknown Concept'}
                  </h5>
                </div>
                
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                  {concept.simple_explanation || 'No explanation available'}
                </p>
                
                {concept.analogy && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm italic flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{concept.analogy}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.learn_more && data.learn_more.length > 0 && (
        <div className="card bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <BookOpen className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-3">Learn More</h4>
              <ul className="space-y-2">
                {data.learn_more.map((resource, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                    <ExternalLink className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-sm">{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob
