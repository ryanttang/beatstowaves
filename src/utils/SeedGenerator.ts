import seedrandom from 'seedrandom';

export async function hashAudioFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSeedFromHash(hash: string): string {
  return hash.slice(0, 16); // Use first 16 hex chars as seed
} 