export interface Employee {
  id: string;
  name: string;
  ra: string;
  cpf: string; // Adicionado
  username: string;
  password: string;
  createdAt: Date;
  inactive?: boolean;
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
  hash?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  employeeId?: string;
}

export type TimeEntryType = 'clockIn' | 'lunchStart' | 'lunchEnd' | 'clockOut';