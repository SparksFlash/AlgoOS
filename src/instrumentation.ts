export function register() {
  if (
    typeof globalThis.localStorage === 'undefined' ||
    typeof globalThis.localStorage.getItem !== 'function'
  ) {
    const storage = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, String(value)),
      removeItem: (key: string) => { storage.delete(key); },
      clear: () => { storage.clear(); },
      get length() { return storage.size; },
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
    } as Storage;
  }
}
