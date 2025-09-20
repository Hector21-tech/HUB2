'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'

export default function SetupPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const runSetup = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/setup-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
      setResult({ error: 'Failed to setup user data' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Please log in first</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Setup User Data</h1>

          <div className="mb-6">
            <p className="text-white/70 mb-4">
              This will create your tenant memberships and organizations in the database.
            </p>
            <p className="text-white/60 text-sm">
              User ID: {user.id}
            </p>
          </div>

          <button
            onClick={runSetup}
            disabled={status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {status === 'loading' ? 'Setting up...' : 'Run Setup'}
          </button>

          {result && (
            <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/10">
              <h3 className="text-white font-medium mb-2">
                {status === 'success' ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="text-white/80 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <a
                href="/dashboard"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}