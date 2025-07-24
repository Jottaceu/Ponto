import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function gerarEspelhoPDF({ funcionario, registros, mesReferencia }: {
  funcionario: { nome: string, ra: string, cpf: string },
  registros: { type: string, timestamp: string }[],
  mesReferencia: string
}) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Espelho de Ponto Mensal', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(\`Funcionário: \${funcionario.nome}\`, 14, 30);
  doc.text(\`RA: \${funcionario.ra}    CPF: \${funcionario.cpf}\`, 14, 36);
  doc.text(\`Mês de Referência: \${mesReferencia}\`, 14, 42);

  autoTable(doc, {
    head: [['Data/Hora', 'Tipo']],
    body: registros.map(r => [
      new Date(r.timestamp).toLocaleString(),
      r.type
    ]),
    startY: 50
  });

  doc.save(\`Espelho_Ponto_\${mesReferencia.replace('-', '_')}.pdf\`);
}
