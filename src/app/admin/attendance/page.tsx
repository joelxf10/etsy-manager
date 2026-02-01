'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Clock, UserCheck, UserX, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { downloadCSV } from '@/lib/csv'

interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  date: string
  login_time: string
  status: 'present' | 'absent' | 'late' | 'half_day'
  notes?: string
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [monthOffset, setMonthOffset] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: e } = await supabase.from('users').select('*').eq('is_active', true).order('name')
      
      // Try to load attendance records
      const { data: a } = await supabase
        .from('employee_attendance')
        .select('*')
        .order('date', { ascending: false })
      
      setEmployees(e || [])
      setAttendance(a || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const today = new Date().toISOString().split('T')[0]

  // Get attendance for selected date
  const dateAttendance = attendance.filter(a => a.date === selectedDate)
  const presentToday = dateAttendance.filter(a => a.status === 'present' || a.status === 'late').length
  const absentToday = dateAttendance.filter(a => a.status === 'absent').length
  const lateToday = dateAttendance.filter(a => a.status === 'late').length

  // Mark attendance
  async function markAttendance(employeeId: string, employeeName: string, status: 'present' | 'absent' | 'late' | 'half_day') {
    setSaving(true)
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    
    // Check if already marked
    const existing = dateAttendance.find(a => a.employee_id === employeeId)
    
    if (existing) {
      // Update
      const { error } = await supabase
        .from('employee_attendance')
        .update({ status, login_time: now })
        .eq('id', existing.id)
      
      if (!error) {
        setAttendance(prev => prev.map(a => a.id === existing.id ? { ...a, status, login_time: now } : a))
      }
    } else {
      // Insert
      const record = {
        employee_id: employeeId,
        employee_name: employeeName,
        date: selectedDate,
        login_time: now,
        status
      }
      
      const { data, error } = await supabase
        .from('employee_attendance')
        .insert(record)
        .select()
        .single()
      
      if (!error && data) {
        setAttendance(prev => [data, ...prev])
      }
    }
    setSaving(false)
  }

  // Mark all present
  async function markAllPresent() {
    setSaving(true)
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    
    for (const emp of employees) {
      const existing = dateAttendance.find(a => a.employee_id === emp.id)
      if (!existing) {
        const record = {
          employee_id: emp.id,
          employee_name: emp.name,
          date: selectedDate,
          login_time: now,
          status: 'present' as const
        }
        const { data } = await supabase.from('employee_attendance').insert(record).select().single()
        if (data) setAttendance(prev => [data, ...prev])
      }
    }
    setSaving(false)
  }

  // Monthly summary
  const getMonthDates = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + monthOffset)
    const year = d.getFullYear()
    const month = d.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    const dates: string[] = []
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`)
    }
    return { dates, monthName }
  }

  const { dates: monthDates, monthName } = getMonthDates()

  // Monthly stats per employee
  const monthlyStats = employees.map(emp => {
    const empRecords = attendance.filter(a => 
      a.employee_id === emp.id && monthDates.includes(a.date)
    )
    return {
      name: emp.name,
      team: emp.team_name || '-',
      present: empRecords.filter(a => a.status === 'present').length,
      late: empRecords.filter(a => a.status === 'late').length,
      absent: empRecords.filter(a => a.status === 'absent').length,
      halfDay: empRecords.filter(a => a.status === 'half_day').length,
      total: empRecords.length
    }
  })

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>
          <p className="text-gray-500">Track daily attendance and generate reports</p>
        </div>
        <button
          onClick={() => downloadCSV('attendance_' + monthName.replace(' ', '_'), ['Employee','Team','Present','Late','Absent','Half Day','Total Days'], monthlyStats.map(s => [s.name, s.team, s.present, s.late, s.absent, s.halfDay, s.total]))}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />Export Monthly
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-xs text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{presentToday}</p>
              <p className="text-xs text-gray-500">Present ({selectedDate === today ? 'Today' : selectedDate})</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{absentToday}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{lateToday}</p>
              <p className="text-xs text-gray-500">Late</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker & Mark All */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          {selectedDate === today && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Today</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllPresent}
            disabled={saving}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* Daily Attendance */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Daily Attendance — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
        </div>
        <div className="divide-y">
          {employees.map(emp => {
            const record = dateAttendance.find(a => a.employee_id === emp.id)
            const status = record?.status || 'unmarked'
            return (
              <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {emp.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.team_name || emp.role || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {record?.login_time && (
                    <span className="text-xs text-gray-400 mr-2">{record.login_time}</span>
                  )}
                  {(['present', 'late', 'absent', 'half_day'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => markAttendance(emp.id, emp.name, s)}
                      disabled={saving}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        status === s
                          ? s === 'present' ? 'bg-green-500 text-white'
                          : s === 'late' ? 'bg-yellow-500 text-white'
                          : s === 'absent' ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s === 'half_day' ? 'Half' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMonthOffset(p => p - 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="font-semibold">{monthName}</h2>
            <button onClick={() => setMonthOffset(p => p + 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button
            onClick={() => downloadCSV('attendance_daily_' + monthName.replace(' ', '_'), ['Date','Employee','Status','Time'], attendance.filter(a => monthDates.includes(a.date)).map(a => [a.date, a.employee_name, a.status, a.login_time || '']))}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-3 h-3" />Export Details
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Half Day</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyStats.map((s, i) => {
                const rate = s.total > 0 ? ((s.present + s.late) / s.total * 100) : 0
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.team}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{s.present}</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">{s.late}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">{s.absent}</td>
                    <td className="px-4 py-3 text-center text-blue-600 font-medium">{s.halfDay}</td>
                    <td className="px-4 py-3 text-center font-medium">{s.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        rate >= 90 ? 'bg-green-100 text-green-700' :
                        rate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{rate.toFixed(0)}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
