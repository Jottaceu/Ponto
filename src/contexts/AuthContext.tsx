import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Employee } from '../types';

interface AuthContextType {
  user: User | null;
  employees: Employee[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedEmployees = localStorage.getItem('employees');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Funcionário padrão para demonstração
      const defaultEmployee: Employee = {
        id: '1',
        name: 'João Silva',
        ra: '001',
        username: 'joao.silva',
        password: '123456',
        createdAt: new Date(),
      };
      setEmployees([defaultEmployee]);
      localStorage.setItem('employees', JSON.stringify([defaultEmployee]));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Admin login
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin',
        username: 'admin',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Employee login
    const employee = employees.find(emp => emp.username === username && emp.password === password);
    if (employee) {
      const employeeUser: User = {
        id: employee.id,
        username: employee.username,
        role: 'employee',
        employeeId: employee.id,
      };
      setUser(employeeUser);
      localStorage.setItem('currentUser', JSON.stringify(employeeUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, ...employeeData } : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const deleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  return (
    <AuthContext.Provider value={{
      user,
      employees,
      login,
      logout,
      addEmployee,
      updateEmployee,
      deleteEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  );
};