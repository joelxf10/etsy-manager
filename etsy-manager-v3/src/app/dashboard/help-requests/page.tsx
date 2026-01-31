'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface HelpRequest {
  id: string
  user_email: string
  question: string
  page: string
  ai_response: string | null
  resolved: boolean
  admin_notes: string | null
  created_at: string
}

export default function HelpRequestsPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const { data } = await supabase
      .from('help_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const resolveRequest = async (id: string) => {
    await supabase.from('help_requests').update({
      resolved: true,
    }).eq('id', id)
    loadRequests()
  }

  const reopenRequest = async (id: string) => {
    await supabase.from('help_requests').update({
      resolved: false,
    }).eq('id', id)
    loadRequests()
  }

  const saveNotes = async (id: string) => {
    await supabase.from('help_requests').update({
      admin_notes: notes,
    }).eq('id', id)
    setEditingNotes(null)
    setNotes('')
    loadRequests()
  }

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this help request?')) return
    await supabase.from('help_requests').delete().eq('id', id)
    loadRequests()
  }

  const filteredRequests = requests.filter(r => {
    if (filter === 'open') return !r.resolved
    if (filter === 'resolved') return r.resolved
    return true
  })

  const openCount = requests.filter(r => !r.resolved).length

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Help Requests</h2>
        <p className="text-sm text-gray-500">
          Questions from users that couldn't be answered automatically
        </p>
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
              {f === 'resolved' && `Resolved (${requests.filter(r => r.resolved).length})`}
              {f === 'all' && `All (${requests.length})`}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl border">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
              <p>No help requests found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRequests.map(request => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${request.resolved ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                          {request.resolved ? 'Resolved' : 'Open'}
                        </span>
                        <span className="text-xs text-gray-500">{request.user_email}</span>
                        <span className="text-xs text-gray-400">• {request.page} page</span>
                        <span className="text-xs text-gray-400">• {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                      
                      <p className="font-medium mb-2">"{request.question}"</p>
                      
                      {request.ai_response && (
                        <div className="bg-gray-50 rounded p-3 text-sm mb-2">
                          <p className="text-xs text-gray-500 mb-1">AI Response (didn't help):</p>
                          <p className="text-gray-600">{request.ai_response}</p>
                        </div>
                      )}

                      {request.admin_notes && (
                        <div className="bg-blue-50 rounded p-3 text-sm mb-2">
                          <p className="text-xs text-blue-500 mb-1">Admin Notes:</p>
                          <p className="text-blue-700">{request.admin_notes}</p>
                        </div>
                      )}

                      {editingNotes === request.id && (
                        <div className="mt-2">
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this issue or how to improve..."
                            className="w-full border rounded p-2 text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => saveNotes(request.id)}
                              className="px-3 py-1 bg-emerald-500 text-white rounded text-sm"
                            >
                              Save Notes
                            </button>
                            <button
                              onClick={() => { setEditingNotes(null); setNotes(''); }}
                              className="px-3 py-1 border rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => { setEditingNotes(request.id); setNotes(request.admin_notes || ''); }}
                        className="text-gray-400 hover:text-blue-500"
                        title="Add notes"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {!request.resolved ? (
                        <button
                          onClick={() => resolveRequest(request.id)}
                          className="bg-emerald-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => reopenRequest(request.id)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => deleteRequest(request.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
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
