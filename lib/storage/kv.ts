/**
 * Key-value storage interface - abstracts storage implementations
 */

/**
 * Interface for key-value storage
 */
export interface KvStore {
  /**
   * Get a value by key
   */
  get(key: string): string | null;

  /**
   * Set a value by key
   */
  set(key: string, value: string): void;

  /**
   * Remove a value by key
   */
  remove(key: string): void;

  /**
   * Check if a key exists
   */
  has(key: string): boolean;

  /**
   * Get the storage name (for logging/debugging)
   */
  readonly name: string;
}

/**
 * Typed helper to get/set JSON values
 */
export interface TypedKvStore<T> {
  get(): T | null;
  set(value: T): void;
  remove(): void;
}

/**
 * Create a typed store wrapper for a specific key
 */
export function createTypedStore<T>(
  store: KvStore,
  key: string
): TypedKvStore<T> {
  return {
    get(): T | null {
      const value = store.get(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    },
    set(value: T): void {
      store.set(key, JSON.stringify(value));
    },
    remove(): void {
      store.remove(key);
    },
  };
}

