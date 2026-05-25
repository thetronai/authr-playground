// Canonical JSON: sorted keys, no whitespace
// Must match the Python _canonical() function exactly

export function canonicalJSON(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    // For numbers, booleans, strings
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJSON).join(',') + ']';
  }
  const keys = Object.keys(obj as object).sort();
  const pairs = keys.map(k => {
    return JSON.stringify(k) + ':' + canonicalJSON((obj as Record<string, unknown>)[k]);
  });
  return '{' + pairs.join(',') + '}';
}

export function canonicalBytes(obj: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalJSON(obj));
}
