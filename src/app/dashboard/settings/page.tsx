'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Store {
  id: string
  name: string
  code: string
  owner: string | null
  status: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function SettingsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStore, setShowAddStore] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', code: '', owner: '' })
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'store_manager' })
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: storesData } = await supabase.from('stores').select('*').order('name')
    if (storesData) setStores(storesData)

    const { data: usersData } = await supabase.from('users').select('*').order('name')
    if (usersData) setUsers(usersData)

    setLoading(false)
  }

  const handleAddStore = async () => {
    if (!newStore.name || !newStore.code) {
      alert('Store name and code are required')
      return
    }

    const { error } = await supabase.from('stores').insert({
      name: newStore.name,
      code: newStore.code.toUpperCase(),
      owner: newStore.owner || null,
      status: 'active',
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowAddStore(false)
      setNewStore({ name: '', code: '', owner: '' })
      loadData()
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email) {
      alert('Email is required')
      return
    }

    // Note: This creates a user record, but they still need to sign up
    // In a full implementation, you'd send an invite email
    const { error } = await supabase.from('users').insert({
      id: crypto.randomUUID(),
      email: newUser.email,
      name: newUser.name || newUser.email.split('@')[0],
      role: newUser.role,
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowAddUser(false)
      setNewUser({ email: '', name: '', role: 'store_manager' })
      loadData()
      alert('User added. They can now sign up with this email to access the system.')
    }
  }

  const deleteStore = async (id: string) => {
    if (!confirm('Delete this store? This will also affect related orders.')) return
    await supabase.from('stores').delete().eq('id', id)
    loadData()
  }

  const updateUserRole = async (userId: string, role: string) => {
    await supabase.from('users').update({ role }).eq('id', userId)
    loadData()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Remove this user?')) return
    await supabase.from('users').delete().eq('id', id)
    loadData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <p className="text-sm text-gray-500">Manage stores, team, and preferences</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Stores */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Stores</h3>
              <button
                onClick={() => setShowAddStore(true)}
                className="text-sm text-emerald-600 hover:underline"
              >
                <i className="fas fa-plus mr-1"></i>Add Store
              </button>
            </div>

            {/* Add Store Modal */}
            {showAddStore && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                      <input
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="UMER - N - BS - UK - S01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Code</label>
                      <input
                        value={newStore.code}
                        onChange={(e) => setNewStore({ ...newStore, code: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="UMERNBS01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner (optional)</label>
                      <input
                        value={newStore.owner}
                        onChange={(e) => setNewStore({ ...newStore, owner: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Team Lead"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowAddStore(false)}
                      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStore}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                    >
                      Add Store
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {stores.length === 0 ? (
                <p className="text-sm text-gray-500">No stores added yet.</p>
              ) : (
                stores.map(store => (
                  <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{store.name}</p>
                      <p className="text-xs text-gray-500">Code: {store.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${store.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                      <button
                        onClick={() => deleteStore(store.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Team Members</h3>
              <button
                onClick={() => setShowAddUser(true)}
                className="text-sm text-emerald-600 hover:underline"
              >
                <i className="fas fa-plus mr-1"></i>Add User
              </button>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="finance">Finance</option>
                        <option value="store_manager">Store Manager</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddUser}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-gray-500">No team members yet.</p>
              ) : (
                users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        user.role === 'admin' ? 'bg-purple-500' :
                        user.role === 'finance' ? 'bg-blue-500' :
                        user.role === 'supplier' ? 'bg-orange-500' : 'bg-green-500'
                      }`}>
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="finance">Finance</option>
                        <option value="store_manager">Store Manager</option>
                        <option value="supplier">Supplier</option>
                      </select>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
