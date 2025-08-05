import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeEntry } from '../contexts/TimeEntryContext';
import { 
  Clock, 
  LogOut, 
  Calendar,
  Coffee,
  LogIn as LogInIcon,
  ArrowRight,
  CheckCircle,
  XCircle,
  History,
  Download
} from 'lucide-react';
import { TimeEntryType } from '../types';

interface EntryResult {
  message: string;
  type: 'success' | 'error';
  pdfBlob?: Blob;
}

const EmployeeDashboard: React.FC = () => {
  const { user, employees, logout } = useAuth();
  const { addTimeEntry, getTodayEntry, getEmployeeEntries } = useTimeEntry();
  const [currentTime, setCurrentTime] = useState(new Date());
  // Novo estado para controlar a mensagem e o blob do PDF
  const [entryResult, setEntryResult] = useState<EntryResult | null>(null);

  const currentEmployee = employees.find(emp => emp.id === user?.employeeId);
  const todayEntry = getTodayEntry(user?.employeeId || '');
  const employeeEntries = getEmployeeEntries(user?.employeeId || '');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeEntry = async (type: TimeEntryType) => {
    if (!user?.employeeId) return;

    // Limpa a mensagem anterior
    setEntryResult(null);

    const result = await addTimeEntry(user.employeeId, type);
    
    if (result.success) {
      setEntryResult({
        message: 'Ponto registrado com sucesso!',
        type: 'success',
        pdfBlob: result.pdfBlob,
      });
    } else {
      setEntryResult({
        message: 'Este tipo de registro já foi feito hoje!',
        type: 'error',
      });
    }

    // A mensagem desaparecerá após 5 segundos
    setTimeout(() => setEntryResult(null), 5000);
  };

  const handleDownloadReceipt = () => {
    if (entryResult?.pdfBlob) {
      const url = URL.createObjectURL(entryResult.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Comprovante_${currentEmployee?.name?.replace(/ /g, '_')}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const timeEntryButtons = [
    {
      type: 'clockIn' as TimeEntryType,
      label: 'Entrada',
      icon: LogInIcon,
      color: 'bg-green-600 hover:bg-green-700',
      completed: !!todayEntry?.clockIn,
    },
    {
      type: 'lunchStart' as TimeEntryType,
      label: 'Início do Almoço',
      icon: Coffee,
      color: 'bg-orange-600 hover:bg-orange-700',
      completed: !!todayEntry?.lunchStart,
    },
    {
      type: 'lunchEnd' as TimeEntryType,
      label: 'Volta do Almoço',
      icon: ArrowRight,
      color: 'bg-blue-600 hover:bg-blue-700',
      completed: !!todayEntry?.lunchEnd,
    },
    {
      type: 'clockOut' as TimeEntryType,
      label: 'Saída',
      icon: LogOut,
      color: 'bg-red-600 hover:bg-red-700',
      completed: !!todayEntry?.clockOut,
    },
  ];

  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const thisMonthEntries = employeeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const currentDate = new Date();
    return entryDate.getMonth() === currentDate.getMonth() && 
           entryDate.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        {/* ... O resto da sua navBar ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">PontoSeg</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {currentEmployee?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('pt-BR')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bloco de mensagem dinâmica */}
        {entryResult && (
          <div className={`mb-6 p-4 rounded-lg border flex justify-between items-center ${
            entryResult.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {entryResult.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              {entryResult.message}
            </div>
            {/* Botão de download condicional */}
            {entryResult.type === 'success' && entryResult.pdfBlob && (
              <button
                onClick={handleDownloadReceipt}
                className="bg-white text-green-800 border border-green-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-800 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Comprovante</span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ... O resto do seu dashboard ... */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Registrar Ponto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timeEntryButtons.map((button) => {
                  const Icon = button.icon;
                  return (
                    <button
                      key={button.type}
                      onClick={() => handleTimeEntry(button.type)}
                      disabled={button.completed}
                      className={`p-6 rounded-lg text-white font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        button.completed ? 'bg-gray-400' : button.color
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <Icon className="h-6 w-6" />
                        <span>{button.label}</span>
                        {button.completed && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {todayEntry && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registros de Hoje</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Entrada</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayEntry.clockIn || '--:--'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Almoço</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayEntry.lunchStart || '--:--'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Volta</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayEntry.lunchEnd || '--:--'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Saída</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayEntry.clockOut || '--:--'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <History className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Histórico - {currentMonth}
                </h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {thisMonthEntries.length > 0 ? (
                  thisMonthEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Entrada:</span>
                          <span className="ml-1 font-medium">{entry.clockIn || '--:--'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Almoço:</span>
                          <span className="ml-1 font-medium">{entry.lunchStart || '--:--'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Volta:</span>
                          <span className="ml-1 font-medium">{entry.lunchEnd || '--:--'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Saída:</span>
                          <span className="ml-1 font-medium">{entry.clockOut || '--:--'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum registro encontrado para este mês.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;