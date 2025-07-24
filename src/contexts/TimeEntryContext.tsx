import React, { createContext, useContext, useEffect, useState } from 'react';
import { TimeEntry, TimeEntryType } from '../types';

interface TimeEntryContextType {
  timeEntries: TimeEntry[];
  addTimeEntry: (employeeId: string, type: TimeEntryType) => Promise<boolean>;
  getEmployeeEntries: (employeeId: string) => TimeEntry[];
  getTodayEntry: (employeeId: string) => TimeEntry | null;
  getEntriesByDateRange: (employeeId: string, startDate: string, endDate: string) => TimeEntry[];
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined);

export const useTimeEntry = () => {
  const context = useContext(TimeEntryContext);
  if (context === undefined) {
    throw new Error('useTimeEntry must be used within a TimeEntryProvider');
  }
  return context;
};

export const TimeEntryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const storedEntries = localStorage.getItem('timeEntries');
    if (storedEntries) {
      setTimeEntries(JSON.parse(storedEntries));
    }
  }, []);

  const addTimeEntry = async (employeeId: string, type: TimeEntryType): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let todayEntry = timeEntries.find(entry => 
      entry.employeeId === employeeId && entry.date === today
    );

    // Validação para evitar registros duplicados
    if (todayEntry && todayEntry[type]) {
      return false;
    }

    if (!todayEntry) {
      todayEntry = {
        id: Date.now().toString(),
        employeeId,
        date: today,
        createdAt: new Date(),
      };
    }

    const updatedEntry = {
      ...todayEntry,
      [type]: currentTime,
    };

    const updatedEntries = timeEntries.filter(entry => 
      !(entry.employeeId === employeeId && entry.date === today)
    );
    
    updatedEntries.push(updatedEntry);
    setTimeEntries(updatedEntries);
    localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    
    return true;
  };

  const getEmployeeEntries = (employeeId: string): TimeEntry[] => {
    return timeEntries.filter(entry => entry.employeeId === employeeId);
  };

  const getTodayEntry = (employeeId: string): TimeEntry | null => {
    const today = new Date().toISOString().split('T')[0];
    return timeEntries.find(entry => 
      entry.employeeId === employeeId && entry.date === today
    ) || null;
  };

  const getEntriesByDateRange = (employeeId: string, startDate: string, endDate: string): TimeEntry[] => {
    return timeEntries.filter(entry => 
      entry.employeeId === employeeId &&
      entry.date >= startDate &&
      entry.date <= endDate
    );
  };

  return (
    <TimeEntryContext.Provider value={{
      timeEntries,
      addTimeEntry,
      getEmployeeEntries,
      getTodayEntry,
      getEntriesByDateRange,
    }}>
      {children}
    </TimeEntryContext.Provider>
  );
};