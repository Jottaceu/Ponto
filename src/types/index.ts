export interface Employee {
  id: string;
  name: string;
  ra: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  lunchStart?: string;
  lunchEnd?: string;
  clockOut?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  employeeId?: string;
}

export type TimeEntryType = 'clockIn' | 'lunchStart' | 'lunchEnd' | 'clockOut';