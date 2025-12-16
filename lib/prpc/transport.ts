/**
 * JSON-RPC Transport Interface
 * 
 * Defines the contract for making JSON-RPC 2.0 calls.
 * This abstraction allows swapping implementations (HTTP, WebSocket, mock).
 */

/**
 * JSON-RPC 2.0 request structure
 */
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: unknown[];
}

/**
 * JSON-RPC 2.0 success response
 */
export interface JsonRpcSuccessResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number | string;
  result: T;
  /**
   * Non-standard: some servers include `error: null` even for successful responses.
   * JSON-RPC 2.0 omits `error` entirely on success.
   */
  error?: null;
}

/**
 * JSON-RPC 2.0 error object
 */
export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * JSON-RPC 2.0 error response
 */
export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  error: JsonRpcErrorObject;
  /** JSON-RPC 2.0 error responses must not include `result`. */
  result?: never;
}

/**
 * Union type for JSON-RPC responses
 */
export type JsonRpcResponse<T = unknown> =
  | JsonRpcSuccessResponse<T>
  | JsonRpcErrorResponse;

/**
 * Type guard to check if response is an error
 */
export function isJsonRpcError(
  response: JsonRpcResponse
): response is JsonRpcErrorResponse {
  // Some servers send `error: null` on success; treat only non-null errors as errors.
  return (response as { error?: unknown }).error != null;
}

/**
 * Options for transport call
 */
export interface TransportCallOptions {
  /** Target URL for the RPC endpoint */
  url: string;
  /** RPC method name */
  method: string;
  /** Method parameters (optional) */
  params?: unknown[];
  /** Request timeout in milliseconds */
  timeoutMs?: number;
  /** Request ID (auto-generated if not provided) */
  requestId?: number | string;
}

/**
 * Result of a transport call
 */
export interface TransportResult<T> {
  /** The successful result data */
  data: T;
  /** Time taken for the request in milliseconds */
  durationMs: number;
}

/**
 * Custom error class for transport failures
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly code: TransportErrorCode,
    public readonly cause?: unknown,
    public readonly rpcError?: JsonRpcErrorObject
  ) {
    super(message);
    this.name = "TransportError";
  }
}

/**
 * Error codes for transport failures
 */
export enum TransportErrorCode {
  /** Network error (fetch failed) */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** Request timed out */
  TIMEOUT = "TIMEOUT",
  /** Invalid JSON response */
  INVALID_JSON = "INVALID_JSON",
  /** JSON-RPC error returned by server */
  RPC_ERROR = "RPC_ERROR",
  /** HTTP error status code */
  HTTP_ERROR = "HTTP_ERROR",
}

/**
 * Transport interface for making JSON-RPC calls
 */
export interface Transport {
  /**
   * Make a JSON-RPC call
   * @throws TransportError on failure
   */
  call<T>(options: TransportCallOptions): Promise<TransportResult<T>>;
}

