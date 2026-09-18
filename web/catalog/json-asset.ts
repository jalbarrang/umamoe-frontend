export async function parseJsonResponse<T>(response: Response, label = response.url): Promise<T> {
  if (!response.ok) throw new Error(`${label || 'Asset'} returned ${response.status}.`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return JSON.parse(new TextDecoder().decode(buffer)) as T;
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decode compressed data assets.');
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text()) as T;
}

export async function fetchJsonAsset<T>(url: string, init: RequestInit = {}): Promise<T> {
  return parseJsonResponse<T>(await fetch(url, { credentials: 'omit', ...init }), url);
}
