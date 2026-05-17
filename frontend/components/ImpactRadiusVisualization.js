import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { AlertTriangle, FileCode, Database, Server, Globe, Zap } from 'lucide-react'

const nodeTypes = {
  custom: CustomNode,
}

function CustomNode({ data }) {
  const Icon = data.icon || FileCode
  const isAffected = data.affected
  const isCritical = data.critical

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: data.delay || 0 }}
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[150px] ${
        isCritical
          ? 'bg-red-500/20 border-red-500 shadow-red-500/50'
          : isAffected
          ? 'bg-orange-500/20 border-orange-500 shadow-orange-500/50'
          : 'bg-dark-card border-dark-border shadow-dark-border/50'
      }`}
    >
      <div className="flex items-center space-x-2 mb-1">
        <Icon className={`w-4 h-4 ${
          isCritical ? 'text-red-400' : isAffected ? 'text-orange-400' : 'text-gray-400'
        }`} />
        <div className={`text-sm font-semibold ${
          isCritical ? 'text-red-300' : isAffected ? 'text-orange-300' : 'text-gray-300'
        }`}>
          {data.label}
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-gray-400 mt-1">{data.description}</div>
      )}
      {isAffected && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
        />
      )}
      {isCritical && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ImpactRadiusVisualization({ data, reports }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [blastRadius, setBlastRadius] = useState(0)

  useEffect(() => {
    if (!reports?.impact) return

    const impact = reports.impact
    const directImpact = impact.direct_impact || []
    const indirectImpact = impact.indirect_impact || []

    // Calculate blast radius
    const radius = directImpact.length + indirectImpact.length * 0.5
    setBlastRadius(Math.round(radius))

    // Create nodes
    const newNodes = []
    const newEdges = []

    // Center node - the PR itself
    newNodes.push({
      id: 'pr',
      type: 'custom',
      position: { x: 400, y: 300 },
      data: {
        label: 'Pull Request',
        description: data?.pr_title?.substring(0, 30) + '...' || 'Current PR',
        icon: Zap,
        affected: true,
        critical: impact.recommendation === 'block',
        delay: 0,
      },
    })

    // Direct impact nodes (inner circle)
    const directRadius = 200
    directImpact.forEach((item, index) => {
      const angle = (index / directImpact.length) * 2 * Math.PI
      const x = 400 + directRadius * Math.cos(angle)
      const y = 300 + directRadius * Math.sin(angle)

      const nodeId = `direct-${index}`
      const isCritical = item.likely_breaks

      newNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x, y },
        data: {
          label: item.file?.split('/').pop() || `File ${index + 1}`,
          description: item.reason?.substring(0, 40) + '...' || '',
          icon: getIconForFile(item.file),
          affected: true,
          critical: isCritical,
          delay: 0.1 + index * 0.05,
        },
      })

      newEdges.push({
        id: `pr-${nodeId}`,
        source: 'pr',
        target: nodeId,
        animated: true,
        style: { stroke: isCritical ? '#ef4444' : '#f97316', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#ef4444' : '#f97316',
        },
      })
    })

    // Indirect impact nodes (outer circle)
    const indirectRadius = 350
    indirectImpact.forEach((item, index) => {
      const angle = (index / indirectImpact.length) * 2 * Math.PI + Math.PI / indirectImpact.length
      const x = 400 + indirectRadius * Math.cos(angle)
      const y = 300 + indirectRadius * Math.sin(angle)

      const nodeId = `indirect-${index}`

      newNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x, y },
        data: {
          label: item.file?.split('/').pop() || `Service ${index + 1}`,
          description: item.reason?.substring(0, 40) + '...' || '',
          icon: getIconForFile(item.file),
          affected: true,
          critical: false,
          delay: 0.3 + index * 0.05,
        },
      })

      // Connect to nearest direct impact node or PR
      const sourceId = directImpact.length > 0 ? `direct-${index % directImpact.length}` : 'pr'
      newEdges.push({
        id: `${sourceId}-${nodeId}`,
        source: sourceId,
        target: nodeId,
        animated: true,
        style: { stroke: '#fbbf24', strokeWidth: 1.5, strokeDasharray: '5,5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#fbbf24',
        },
      })
    })

    // Add safe nodes (unaffected services)
    const safeFiles = impact.safe_files?.slice(0, 6) || []
    const safeRadius = 480
    safeFiles.forEach((file, index) => {
      const angle = (index / safeFiles.length) * 2 * Math.PI
      const x = 400 + safeRadius * Math.cos(angle)
      const y = 300 + safeRadius * Math.sin(angle)

      const nodeId = `safe-${index}`

      newNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x, y },
        data: {
          label: file.split('/').pop() || `Safe ${index + 1}`,
          description: 'Unaffected',
          icon: getIconForFile(file),
          affected: false,
          critical: false,
          delay: 0.5 + index * 0.05,
        },
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [reports, data])

  const getIconForFile = (filename) => {
    if (!filename) return FileCode
    if (filename.includes('database') || filename.includes('db')) return Database
    if (filename.includes('server') || filename.includes('api')) return Server
    if (filename.includes('route') || filename.includes('endpoint')) return Globe
    return FileCode
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Impact Radius</h3>
            <p className="text-gray-400">Dependency graph and blast radius analysis</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg"
          >
            <div className="text-sm text-gray-400">Blast Radius</div>
            <div className="text-2xl font-bold text-orange-400">{blastRadius}</div>
          </motion.div>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-300">Critical Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-300">Direct Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-300">Indirect Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span className="text-gray-300">Unaffected</span>
          </div>
        </div>
      </div>

      <div className="relative h-[600px] bg-dark-bg rounded-lg border border-dark-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-dark-bg"
        >
          <Background color="#374151" gap={16} />
          <Controls className="bg-dark-card border-dark-border" />
          <MiniMap
            className="bg-dark-card border border-dark-border"
            nodeColor={(node) => {
              if (node.data.critical) return '#ef4444'
              if (node.data.affected) return '#f97316'
              return '#6b7280'
            }}
          />
        </ReactFlow>

        {/* Animated ripple effect from center */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <div className="w-32 h-32 border-4 border-orange-500 rounded-full" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 p-4 bg-dark-bg rounded-lg border border-dark-border"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-white">Impact Analysis:</span> This visualization shows
            how changes propagate through your codebase. Red nodes indicate critical breaking changes,
            orange shows direct dependencies, and yellow represents indirect effects.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Made with Bob - Elite Edition