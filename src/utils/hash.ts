import SHA256 from 'crypto-js/sha256';

export function generateHash(employeeId: string, type: string, timestamp: string): string {
  return SHA256(`${employeeId}-${type}-${timestamp}`).toString();
}
