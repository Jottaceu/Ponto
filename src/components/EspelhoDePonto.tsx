import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EspelhoDePonto({ employeeId }: { employeeId: string }) {
  const [registros, setRegistros] = useState<any[]>([]);
  const [aceite, setAceite] = useState<boolean | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregarPontos() {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('timestamp', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .order('timestamp', { ascending: true });

      if (error) console.error(error);
      else setRegistros(data);
      setCarregado(true);
    }

    carregarPontos();
  }, [employeeId]);

  const confirmarAceite = async () => {
    const { error } = await supabase.from('espelho_aceites').insert([{
      employee_id: employeeId,
      mes_referencia: new Date().toISOString().slice(0, 7),
      aceito: true
    }]);
    if (!error) setAceite(true);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-bold mb-2">Espelho de Ponto - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
      {!carregado && <p>Carregando...</p>}
      <ul className="text-sm">
        {registros.map((r) => (
          <li key={r.id}>{new Date(r.timestamp).toLocaleString()} - {r.type}</li>
        ))}
      </ul>
      {aceite === true ? (
        <p className="text-green-600 mt-2">Ponto aceito.</p>
      ) : (
        <button onClick={confirmarAceite} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Confirmar Aceite
        </button>
      )}
    </div>
  );
}
