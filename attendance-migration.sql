-- Employee Attendance Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS employee_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES users(id),
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  login_time TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_attendance_date ON employee_attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON employee_attendance(employee_id);

-- Enable RLS
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (tighten later with auth)
CREATE POLICY "Allow all attendance" ON employee_attendance FOR ALL USING (true) WITH CHECK (true);
