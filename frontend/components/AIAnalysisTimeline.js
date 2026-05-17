import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Loader2,
  Clock,
  Shield,
  TestTube,
  FileText,
  GraduationCap,
  Target,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react'

const analysisSteps = [
  {
    id: 'repository',
    label: 'Repository Analyzed',
    description: 'Cloned and indexed codebase structure',
    icon: FileText,
    duration: 2000,
    agent: 'Context Agent'
  },
  {
    id: 'dependencies',
    label: 'Dependencies Mapped',
    description: 'Built dependency graph and impact tree',
    icon: Target,
    duration: 3000,
    agent: 'Impact Agent'
  },
  {
    id: 'security',
    label: 'Security Scan Complete',
    description: 'Analyzed for vulnerabilities and threats',
    icon: Shield,
    duration: 4000,
    agent: 'Security Agent'
  },
  {
    id: 'tests',
    label: 'Tests Generated',
    description: 'Created comprehensive test suite',
    icon: TestTube,
    duration: 5000,
    agent: 'Testing Agent'
  },
  {
    id: 'documentation',
    label: 'Documentation Updated',
    description: 'Generated API docs and comments',
    icon: FileText,
    duration: 6000,
    agent: 'Documentation Agent'
  },
  {
    id: 'junior',
    label: 'Junior Guide Created',
    description: 'Prepared beginner-friendly explanation',
    icon: GraduationCap,
    duration: 7000,
    agent: 'Mentor Agent'
  },
  {
    id: 'risk',
    label: 'Merge Risk Calculated',
    description: 'Computed safety score and recommendations',
    icon: Zap,
    duration: 8000,
    agent: 'Risk Agent'
  }
]

export default function AIAnalysisTimeline({ status, onComplete }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (status === 'analyzing' && !isAnalyzing) {
      setIsAnalyzing(true)
      setCurrentStep(-1)
      setCompletedSteps([])
      runAnalysis()
    } else if (status === 'complete' && isAnalyzing) {
      setIsAnalyzing(false)
      setCurrentStep(-1)
      setCompletedSteps(analysisSteps.map(s => s.id))
    }
  }, [status])

  const runAnalysis = async () => {
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCompletedSteps(prev => [...prev, analysisSteps[i].id])
    }
    setCurrentStep(-1)
    if (onComplete) onComplete()
  }

  const getStepStatus = (index) => {
    if (completedSteps.includes(analysisSteps[index].id)) return 'complete'
    if (currentStep === index) return 'active'
    if (currentStep > index) return 'complete'
    return 'pending'
  }

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
            <Brain className="w-7 h-7 text-purple-400" />
            <span>AI Analysis Pipeline</span>
          </h3>
          <p className="text-gray-400">Multi-agent orchestration in progress</p>
        </div>
        {isAnalyzing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg"
          >
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Analyzing...</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {analysisSteps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          const Icon = step.icon
          const isActive = stepStatus === 'active'
          const isComplete = stepStatus === 'complete'
          const isPending = stepStatus === 'pending'

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connecting line */}
              {index < analysisSteps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-dark-border">
                  {isComplete && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-gradient-to-b from-blue-500 to-purple-500"
                    />
                  )}
                </div>
              )}

              <div
                className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20'
                    : isComplete
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-dark-bg border-dark-border'
                }`}
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={
                      isActive
                        ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                        : {}
                    }
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                        : isComplete
                        ? 'bg-green-500'
                        : 'bg-dark-card'
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : isComplete ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-gray-400" />
                    )}
                  </motion.div>

                  {/* Pulse effect for active step */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-lg font-semibold ${
                        isActive
                          ? 'text-blue-400'
                          : isComplete
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400'
                          : isComplete
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}
                    >
                      {step.agent}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      isActive || isComplete ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Progress bar for active step */}
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                      className="mt-2 h-1 bg-blue-500 rounded-full"
                    />
                  )}

                  {/* Completion timestamp */}
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-1 mt-2 text-xs text-gray-500"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Completed</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                Powered by IBM Bob + watsonx.ai
              </div>
              <div className="text-xs text-gray-400">
                Multi-agent AI orchestration system
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {completedSteps.length}/{analysisSteps.length}
            </div>
            <div className="text-xs text-gray-400">Steps Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-dark-card rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(completedSteps.length / analysisSteps.length) * 100}%`
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Made with Bob - Elite Edition