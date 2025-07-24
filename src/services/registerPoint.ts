import { supabase } from '../supabaseClient';
import { generateHash } from '../utils/hash';

export async function registerPoint(employeeId: string, type: string) {
  const timestamp = new Date().toISOString();
  const hash = generateHash(employeeId, type, timestamp);

  const { error } = await supabase.from('time_entries').insert([
    {
      employee_id: employeeId,
      type,
      timestamp,
      hash,
    }
  ]);

  if (error) {
    console.error('Erro ao registrar ponto:', error.message);
    return false;
  }

  return true;
}
