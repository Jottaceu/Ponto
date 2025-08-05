import React, { createContext, useContext, useEffect, useState } from 'react';
import { TimeEntry, TimeEntryType, Employee } from '../types';
import { generateHash } from '../utils/hash';
import { gerarComprovantePDF } from '../utils/gerarComprovantePDF';
import { useAuth } from './AuthContext';

// Define a interface para o valor de retorno de addTimeEntry
interface AddTimeEntryResult {
  success: boolean;
  pdfBlob?: Blob;
}

interface TimeEntryContextType {
  timeEntries: TimeEntry[];
  // Atualiza a assinatura da função
  addTimeEntry: (employeeId: string, type: TimeEntryType) => Promise<AddTimeEntryResult>;
  getEmployeeEntries: (employeeId: string) => TimeEntry[];
  getTodayEntry: (employeeId: string) => TimeEntry | null;
  getEntriesByDateRange: (employeeId: string, startDate: string, endDate: string) => TimeEntry[];
  gerarAFDT: (startDate: string, endDate: string) => void;
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
  const { employees } = useAuth();

  useEffect(() => {
    const storedEntries = localStorage.getItem('timeEntries');
    if (storedEntries) {
      setTimeEntries(JSON.parse(storedEntries));
    }
  }, [employees]);

  const addTimeEntry = async (employeeId: string, type: TimeEntryType): Promise<AddTimeEntryResult> => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const timestamp = new Date().toISOString();

    let todayEntry = timeEntries.find(entry =>
      entry.employeeId === employeeId && entry.date === today
    );

    if (todayEntry && todayEntry[type]) {
      return { success: false };
    }

    const hash = generateHash(employeeId, type, timestamp);
    const newTimeEntryPart = { [type]: currentTime, hash };

    let finalEntry: TimeEntry;
    let pdfBlob: Blob | undefined;

    if (todayEntry) {
        const updatedEntry = { ...todayEntry, ...newTimeEntryPart };
        finalEntry = updatedEntry;
        const updatedEntries = timeEntries.map(e => e.id === todayEntry!.id ? updatedEntry : e);
        setTimeEntries(updatedEntries);
        localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    } else {
        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            employeeId,
            date: today,
            createdAt: new Date(),
            ...newTimeEntryPart
        };
        finalEntry = newEntry;
        const updatedEntries = [...timeEntries, newEntry];
        setTimeEntries(updatedEntries);
        localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    }

    const currentEmployee = employees.find(emp => emp.id === employeeId);
    if (currentEmployee) {
        pdfBlob = gerarComprovantePDF(currentEmployee, finalEntry, type as keyof TimeEntry, currentTime);
    }
    
    return { success: true, pdfBlob };
  };

  // As outras funções permanecem as mesmas...
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

  const gerarAFDT = (startDate: string, endDate: string) => {
    let afdText = '';
    const filteredEntries = timeEntries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });

    filteredEntries.forEach(entry => {
      const employee = employees.find(emp => emp.id === entry.employeeId);
      if (employee) {
        const entryTime = new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour12: false });
        afdText += `${entry.id.padEnd(9, ' ')}${entry.date.replace(/-/g, '')}${entryTime.replace(/:/g, '')}1${employee.ra.padEnd(12, ' ')}\n`;
      }
    });

    const blob = new Blob([afdText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `AFD_${startDate}_${endDate}.txt`;
    link.click();
  }


  return (
    <TimeEntryContext.Provider value={{
      timeEntries,
      addTimeEntry,
      getEmployeeEntries,
      getTodayEntry,
      getEntriesByDateRange,
      gerarAFDT
    }}>
      {children}
    </TimeEntryContext.Provider>
  );
};