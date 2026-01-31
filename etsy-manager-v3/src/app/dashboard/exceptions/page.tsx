'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Exception {
  id: string
  order_number: string
  store_name: string
  store_sku: string
  issue: string
  action_owner: string | null
  fix_type: string | null
  resolved: boolean
  resolved_at: string | null
  resolver: string | null
  created_at: string
}

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')

  useEffect(() => {
    loadExceptions()
  }, [])

  const loadExceptions = async () => {
    const { data } = await supabase
      .from('exceptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setExceptions(data)
    }
    setLoading(false)
  }

  const resolveException = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('exceptions').update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolver: session?.user.email || 'Unknown'
    }).eq('id', id)
    loadExceptions()
  }

  const reopenException = async (id: string) => {
    await supabase.from('exceptions').update({
      resolved: false,
      resolved_at: null,
      resolver: null,
    }).eq('id', id)
    loadExceptions()
  }

  const deleteException = async (id: string) => {
    if (!confirm('Delete this exception?')) return
    await supabase.from('exceptions').delete().eq('id', id)
    loadExceptions()
  }

  const filteredExceptions = exceptions.filter(e => {
    if (filter === 'open') return !e.resolved
    if (filter === 'resolved') return e.resolved
    return true
  })

  const openCount = exceptions.filter(e => !e.resolved).length
  const resolvedCount = exceptions.filter(e => e.resolved).length

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Exceptions Queue</h2>
          <p className="text-sm text-gray-500">
            <span className="text-red-600 font-medium">{openCount}</span> open, {' '}
            <span className="text-gray-600">{resolvedCount}</span> resolved
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['open', 'resolved', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f ? 'bg-emerald-500 text-white' : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {f === 'open' && `Open (${openCount})`}
              {f === 'resolved' && `Resolved (${resolvedCount})`}
              {f === 'all' && `All (${exceptions.length})`}
            </button>
          ))}
        </div>

        {/* Exceptions List */}
        <div className="bg-white rounded-xl border">
          {filteredExceptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-check-circle text-4xl mb-4 text-emerald-300"></i>
              <p>No exceptions found. All clear!</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredExceptions.map(exception => (
                <div key={exception.id} className="p-4 hover:bg-gray-50 flex items-center justify-between" data-tour="exception-item">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${exception.resolved ? 'bg-gray-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${exception.resolved ? 'fa-check' : 'fa-exclamation-triangle'} ${exception.resolved ? 'text-gray-400' : 'text-red-600'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium">Order #{exception.order_number}</p>
                      <p className="text-sm text-gray-600">{exception.issue}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {exception.store_name} • {exception.store_sku} • {new Date(exception.created_at).toLocaleDateString()}
                      </p>
                      {exception.resolved && exception.resolved_at && (
                        <p className="text-xs text-emerald-600 mt-1">
                          Resolved by {exception.resolver} on {new Date(exception.resolved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exception.fix_type && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{exception.fix_type}</span>
                    )}
                    {!exception.resolved ? (
                      <button
                        onClick={() => resolveException(exception.id)}
                        className="bg-emerald-500 text-white px-3 py-1 rounded text-sm hover:bg-emerald-600"
                        data-tour="exception-resolve"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => reopenException(exception.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => deleteException(exception.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
