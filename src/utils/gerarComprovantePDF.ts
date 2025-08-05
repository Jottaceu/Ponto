import jsPDF from 'jspdf';
import { Employee, TimeEntry } from '../types';

export function gerarComprovantePDF(employee: Employee, timeEntry: TimeEntry, type: keyof TimeEntry, time: string): Blob {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Comprovante de Registro de Ponto do Trabalhador', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Empregador: NOME DA EMPRESA`, 14, 30);
  doc.text(`CNPJ: XX.XXX.XXX/XXXX-XX`, 14, 36);
  doc.text(`Endereço: ENDEREÇO DA EMPRESA`, 14, 42);

  doc.text(`----------------------------------------------------------------------------------------------------`, 14, 50)

  doc.text(`Funcionário: ${employee.name}`, 14, 60);
  // USANDO O CPF REAL DO FUNCIONÁRIO
  doc.text(`CPF: ${employee.cpf}`, 14, 66);
  doc.text(`Data e Hora: ${new Date(timeEntry.date + 'T00:00:00').toLocaleDateString('pt-BR')} ${time}`, 14, 72);
  
  let tipoRegistroLabel = '';
  switch (type) {
    case 'clockIn':
      tipoRegistroLabel = 'Entrada';
      break;
    case 'lunchStart':
      tipoRegistroLabel = 'Início do Almoço';
      break;
    case 'lunchEnd':
      tipoRegistroLabel = 'Volta do Almoço';
      break;
    case 'clockOut':
      tipoRegistroLabel = 'Saída';
      break;
    default:
      tipoRegistroLabel = String(type);
  }
  doc.text(`Tipo de Registro: ${tipoRegistroLabel}`, 14, 78);

  doc.text(`NSR: ${timeEntry.id}`, 14, 84);
  doc.text(`Hash (SHA-256): ${timeEntry.hash}`, 14, 90, {
    maxWidth: 180,
  });

  doc.text(`----------------------------------------------------------------------------------------------------`, 14, 100)

  doc.text('Assinatura Eletrônica (a ser implementada com certificado digital):', 14, 110);
  doc.text('________________________________', 14, 120);

  return doc.output('blob');
}