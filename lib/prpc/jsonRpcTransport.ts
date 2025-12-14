import {
  Transport,
  TransportCallOptions,
  TransportResult,
  TransportError,
  TransportErrorCode,
  JsonRpcRequest,
  JsonRpcResponse,
  isJsonRpcError,
} from "./transport";
import { getPrpcTimeoutMs } from "@/lib/config/env";

/**
 * Auto-incrementing request ID generator
 */
let requestIdCounter = 1;
function generateRequestId(): number {
  return requestIdCounter++;
}

/**
 * HTTP JSON-RPC 2.0 Transport Implementation
 *
 * Features:
 * - AbortController-based timeouts
 * - Typed error handling
 * - Request duration tracking
 */
class JsonRpcHttpTransport implements Transport {
  async call<T>(options: TransportCallOptions): Promise<TransportResult<T>> {
    const {
      url,
      method,
      params = [],
      timeoutMs = getPrpcTimeoutMs(),
      requestId = generateRequestId(),
    } = options;

    const startTime = performance.now();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Build JSON-RPC request
    const rpcRequest: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: requestId,
      method,
      params,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rpcRequest),
        signal: controller.signal,
      });

      // Check HTTP status
      if (!response.ok) {
        throw new TransportError(
          `HTTP ${response.status}: ${response.statusText}`,
          TransportErrorCode.HTTP_ERROR
        );
      }

      // Parse JSON response
      let jsonResponse: JsonRpcResponse<T>;
      try {
        jsonResponse = await response.json();
      } catch (parseError) {
        throw new TransportError(
          "Failed to parse JSON response",
          TransportErrorCode.INVALID_JSON,
          parseError
        );
      }

      // Check for JSON-RPC error
      if (isJsonRpcError(jsonResponse)) {
        throw new TransportError(
          `RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`,
          TransportErrorCode.RPC_ERROR,
          undefined,
          jsonResponse.error
        );
      }

      const durationMs = performance.now() - startTime;

      return {
        data: jsonResponse.result,
        durationMs,
      };
    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new TransportError(
          `Request timed out after ${timeoutMs}ms`,
          TransportErrorCode.TIMEOUT,
          error
        );
      }

      // Re-throw TransportError as-is
      if (error instanceof TransportError) {
        throw error;
      }

      // Wrap other errors as network errors
      throw new TransportError(
        error instanceof Error ? error.message : "Network request failed",
        TransportErrorCode.NETWORK_ERROR,
        error
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Singleton transport instance
 */
export const jsonRpcTransport = new JsonRpcHttpTransport();

/**
 * Convenience function to make a JSON-RPC call
 */
export async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[] = [],
  timeoutMs?: number
): Promise<TransportResult<T>> {
  return jsonRpcTransport.call<T>({ url, method, params, timeoutMs });
}

