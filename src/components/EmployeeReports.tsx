import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntry } from '../contexts/TimeEntryContext';
import { Calendar, Download, Filter, Clock, User } from 'lucide-react';

const EmployeeReports: React.FC = () => {
  const { employees } = useAuth();
  const { timeEntries } = useTimeEntry();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const matchesEmployee = !selectedEmployee || entry.employeeId === selectedEmployee;
      const matchesDate = entry.date >= dateRange.start && entry.date <= dateRange.end;
      return matchesEmployee && matchesDate;
    });
  }, [timeEntries, selectedEmployee, dateRange]);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.name || 'Funcionário não encontrado';
  };

  const getEmployeeRA = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.ra || 'N/A';
  };

  const calculateWorkingHours = (entry: any) => {
    if (!entry.clockIn || !entry.clockOut) return 'Incompleto';
    
    const clockIn = new Date(`2000-01-01 ${entry.clockIn}`);
    const clockOut = new Date(`2000-01-01 ${entry.clockOut}`);
    
    let totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    
    // Subtrair tempo de almoço se disponível
    if (entry.lunchStart && entry.lunchEnd) {
      const lunchStart = new Date(`2000-01-01 ${entry.lunchStart}`);
      const lunchEnd = new Date(`2000-01-01 ${entry.lunchEnd}`);
      const lunchMinutes = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
      totalMinutes -= lunchMinutes;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  const exportToCSV = () => {
    const csvData = filteredEntries.map(entry => ({
      'Nome': getEmployeeName(entry.employeeId),
      'RA': getEmployeeRA(entry.employeeId),
      'Data': new Date(entry.date).toLocaleDateString('pt-BR'),
      'Entrada': entry.clockIn || '',
      'Início Almoço': entry.lunchStart || '',
      'Fim Almoço': entry.lunchEnd || '',
      'Saída': entry.clockOut || '',
      'Horas Trabalhadas': calculateWorkingHours(entry),
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_pontos_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Relatórios de Ponto</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funcionário
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os funcionários</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} (RA: {employee.ra})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Almoço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {getEmployeeName(entry.employeeId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          RA: {getEmployeeRA(entry.employeeId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.clockIn || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.lunchStart || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.lunchEnd || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.clockOut || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {calculateWorkingHours(entry)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredEntries.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredEntries.length} registro(s) encontrado(s).
        </div>
      )}
    </div>
  );
};

export default EmployeeReports;