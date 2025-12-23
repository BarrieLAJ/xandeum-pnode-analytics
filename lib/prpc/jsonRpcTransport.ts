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
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

/**
 * Auto-incrementing request ID generator
 */
let requestIdCounter = 1;
function generateRequestId(): number {
  return requestIdCounter++;
}

async function postJson(urlString: string, body: string, timeoutMs: number): Promise<{
  status: number;
  statusText: string;
  bodyText: string;
}> {
  const url = new URL(urlString);
  const isHttps = url.protocol === "https:";
  const reqFn = isHttps ? httpsRequest : httpRequest;

  return await new Promise((resolve, reject) => {
    const req = reqFn(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Connection": "keep-alive", // Reuse connections for better performance
        },
        timeout: timeoutMs, // Set socket timeout
      },
      (res) => {
        let bodyText = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          bodyText += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            statusText: res.statusMessage ?? "",
            bodyText,
          });
        });
      }
    );

    const timeoutId = setTimeout(() => {
      // Abort the request cleanly on timeout
      if (!req.destroyed) {
        req.destroy(new Error("Request timed out"));
      }
    }, timeoutMs);

    req.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
    req.on("close", () => {
      clearTimeout(timeoutId);
    });
    req.on("timeout", () => {
      // Handle socket timeout (different from our manual timeout)
      clearTimeout(timeoutId);
      if (!req.destroyed) {
        req.destroy(new Error("Socket timed out"));
      }
    });

    req.write(body);
    req.end();
  });
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

    // Build JSON-RPC request
    const rpcRequest: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: requestId,
      method,
      params,
    };

    try {
      // NOTE: Node's built-in fetch blocks some ports (including 6000).
      // Use node:http/https so we can call pNode pRPC on :6000.
      const { status, statusText, bodyText } = await postJson(
        url,
        JSON.stringify(rpcRequest),
        timeoutMs
      );

      if (status < 200 || status >= 300) {
        throw new TransportError(
          `HTTP ${status}: ${statusText}`,
          TransportErrorCode.HTTP_ERROR
        );
      }

      // Parse JSON response
      let jsonResponse: JsonRpcResponse<T>;
      try {
        jsonResponse = JSON.parse(bodyText) as JsonRpcResponse<T>;
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
      // Handle timeout
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.toLowerCase().includes("timed out"))
      ) {
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
        error instanceof Error
          ? error.cause instanceof Error
            ? `${error.message} (${error.cause.message})`
            : error.message
          : "Network request failed",
        TransportErrorCode.NETWORK_ERROR,
        error
      );
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

