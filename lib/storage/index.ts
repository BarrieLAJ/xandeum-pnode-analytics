/**
 * Storage abstractions barrel export
 */

// Interface
export type { KvStore, TypedKvStore } from "./kv";
export { createTypedStore } from "./kv";

// Implementation
export { LocalStorageKv, getLocalStorageKv } from "./localStorageKv";

