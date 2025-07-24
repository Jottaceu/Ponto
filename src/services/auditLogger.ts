import { supabase } from '../supabaseClient';

export async function logAudit({
  tableName,
  recordId,
  action,
  changedBy,
  justification,
  oldData,
  newData
}: {
  tableName: string,
  recordId: string,
  action: 'insert' | 'update' | 'delete',
  changedBy: string,
  justification?: string,
  oldData?: object,
  newData?: object
}) {
  const { error } = await supabase.from('audit_logs').insert([{
    table_name: tableName,
    record_id: recordId,
    action,
    changed_by: changedBy,
    justification,
    old_data: oldData,
    new_data: newData,
  }]);

  if (error) {
    console.error('Erro ao registrar log de auditoria:', error.message);
  }
}
