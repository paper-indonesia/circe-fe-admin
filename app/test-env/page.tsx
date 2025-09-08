'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function TestEnvPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkEnvironment = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/test-env')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch environment data')
      }
      
      setEnvData(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching env:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Environment Variables Test</span>
              <Button 
                onClick={checkEnvironment} 
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {envData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* NODE_ENV */}
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">NODE_ENV</div>
                    <div className="font-mono text-sm">{envData.NODE_ENV || 'Not Set'}</div>
                  </div>

                  {/* MONGO_URI Status */}
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">MONGO_URI</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {envData.MONGO_URI?.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {envData.MONGO_URI?.exists ? 'Configured' : 'Not Configured'}
                        </span>
                      </div>
                      {envData.MONGO_URI?.exists && (
                        <>
                          <div className="text-xs text-gray-600">
                            Length: {envData.MONGO_URI.length} chars
                          </div>
                          <div className="text-xs text-gray-600">
                            Protocol: {envData.MONGO_URI.startsWithMongodb ? 'Valid' : 'Invalid'}
                          </div>
                          <div className="text-xs text-gray-600 break-all">
                            Masked: {envData.MONGO_URI.masked}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* JWT_SECRET Status */}
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">JWT_SECRET</div>
                    <div className="flex items-center gap-2">
                      {envData.JWT_SECRET?.exists ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {envData.JWT_SECRET?.exists ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                    {envData.JWT_SECRET?.exists && (
                      <div className="text-xs text-gray-600 mt-1">
                        Length: {envData.JWT_SECRET.length} chars
                      </div>
                    )}
                  </div>

                  {/* Database Connection Test */}
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Database Connection</div>
                    <div className="flex items-center gap-2">
                      {envData.dbConnection?.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {envData.dbConnection?.success ? 'Connected' : 'Failed'}
                      </span>
                    </div>
                    {envData.dbConnection?.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {envData.dbConnection.error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Server Logs */}
                {envData.serverLogs && (
                  <div className="border rounded-lg p-4 mt-4">
                    <div className="text-sm text-gray-500 mb-2">Server Console Logs</div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                      {envData.serverLogs}
                    </pre>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-right">
                  Last checked: {new Date(envData.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Checking environment...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Deploy aplikasi ke Vercel</li>
              <li>Akses: <code className="bg-gray-100 px-2 py-1 rounded">https://your-domain.vercel.app/test-env</code></li>
              <li>Halaman ini akan menampilkan status environment variables</li>
              <li>Check Vercel Function Logs untuk melihat console.log detail</li>
              <li>Jika MONGO_URI tidak terdeteksi, check di Vercel Dashboard → Settings → Environment Variables</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}