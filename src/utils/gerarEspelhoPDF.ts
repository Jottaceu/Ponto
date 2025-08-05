import jsPDF from 'jspdf';
import { Employee, TimeEntry } from '../types';

export function gerarComprovantePDF(employee: Employee, timeEntry: TimeEntry, type: keyof TimeEntry, time: string) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Comprovante de Registro de Ponto do Trabalhador', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Empregador: NOME DA EMPRESA`, 14, 30);
  doc.text(`CNPJ: XX.XXX.XXX/XXXX-XX`, 14, 36);
  doc.text(`Endereço: ENDEREÇO DA EMPRESA`, 14, 42);

  doc.text(`----------------------------------------------------------------------------------------------------`, 14, 50)

  doc.text(`Funcionário: ${employee.name}`, 14, 60);
  doc.text(`CPF: XXX.XXX.XXX-XX`, 14, 66);
  doc.text(`Data e Hora: ${new Date(timeEntry.date).toLocaleDateString('pt-BR')} ${time}`, 14, 72);
  doc.text(`Tipo de Registro: ${type}`, 14, 78);
  doc.text(`NSR: ${timeEntry.id}`, 14, 84);
  doc.text(`Hash (SHA-256): ${timeEntry.hash}`, 14, 90, {
    maxWidth: 180,
  });


  doc.text(`----------------------------------------------------------------------------------------------------`, 14, 100)


  doc.text('Assinatura Eletrônica:', 14, 110);
  doc.text('________________________________', 14, 120);


  doc.save(`Comprovante_${employee.name.replace(/ /g, '_')}_${timeEntry.date}.pdf`);
}
