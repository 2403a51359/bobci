import { useState } from 'react'
import { Github, Key, Lock, Webhook, CheckCircle, RefreshCw } from 'lucide-react'
import { addRepository } from '../lib/api'
import { useRouter } from 'next/router'

export default function Setup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    owner: '',
    repo: '',
    token: '',
    secret: generateSecret()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function generateSecret() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await addRepository(
        formData.owner,
        formData.repo,
        formData.token,
        formData.secret
      )
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect repository')
    } finally {
      setLoading(false)
    }
  }

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:8000/webhook/github`
    : 'http://localhost:8000/webhook/github'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Setup Repository</h1>
        <p className="text-gray-400">Connect your GitHub repository to BobCI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-blue-500">1</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Create Token</h3>
          <p className="text-sm text-gray-400">
            Generate a GitHub Personal Access Token with repo permissions
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-purple-500">2</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Add Repository</h3>
          <p className="text-sm text-gray-400">
            Enter your repository details and token below
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-green-500">3</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Configure Webhook</h3>
          <p className="text-sm text-gray-400">
            Set up the webhook in your GitHub repository settings
          </p>
        </div>
      </div>

      {success ? (
        <div className="card bg-green-500/10 border-green-500/20 text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Repository Connected!</h3>
          <p className="text-gray-400 mb-4">Redirecting to dashboard...</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Github className="w-6 h-6 text-blue-500" />
                <span>Repository Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Owner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., facebook"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The username or organization that owns the repository
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., react"
                    value={formData.repo}
                    onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                    className="input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The name of the repository (without the owner)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Personal Access Token</span>
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    className="input font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Create at{' '}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      github.com/settings/tokens/new
                    </a>
                    {' '}with <code className="text-blue-400">repo</code> scope
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Webhook Secret</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.secret}
                      onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                      className="input font-mono flex-1"
                      required
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, secret: generateSecret() })}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This secret will be used to verify webhook requests from GitHub
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Connect Repository</span>
                </>
              )}
            </button>
          </form>

          <div className="card bg-yellow-500/5 border-yellow-500/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Webhook className="w-6 h-6 text-yellow-500" />
              <span>Step 3: Configure GitHub Webhook</span>
            </h3>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                After connecting your repository, configure the webhook in GitHub:
              </p>

              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>
                    Go to your repository settings → Webhooks → Add webhook
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <div className="flex-1">
                    <span>Set the Payload URL to:</span>
                    <div className="mt-2 bg-dark-bg border border-dark-border rounded p-3 font-mono text-xs break-all">
                      {webhookUrl}
                    </div>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Set Content type to <code className="text-blue-400">application/json</code></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <div className="flex-1">
                    <span>Set the Secret to:</span>
                    <div className="mt-2 bg-dark-bg border border-dark-border rounded p-3 font-mono text-xs break-all">
                      {formData.secret}
                    </div>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">5.</span>
                  <span>Select "Let me select individual events" and check <strong>Pull requests</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">6.</span>
                  <span>Click "Add webhook"</span>
                </li>
              </ol>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                <p className="text-blue-400 text-sm">
                  💡 <strong>Tip:</strong> If testing locally, use{' '}
                  <a
                    href="https://ngrok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-300"
                  >
                    ngrok
                  </a>
                  {' '}to expose your local server to GitHub webhooks
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Made with Bob
