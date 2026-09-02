export type LogMetadata = Readonly<Record<string, unknown>>;

const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
  /password|passwd|secret|token|authorization|cookie|api[-_]?key|credential/i;
const MAX_DEPTH = 6;

function sanitizeValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint" || typeof value === "symbol") {
    return String(value);
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : "Invalid Date";
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(value.cause === undefined
        ? {}
        : { cause: sanitizeValue(value.cause, seen, depth + 1) }),
    };
  }

  if (depth >= MAX_DEPTH) {
    return "[Max depth]";
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, seen, depth + 1));
    }

    const sanitized: Record<string, unknown> = {};
    try {
      for (const [key, item] of Object.entries(value)) {
        sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
          ? REDACTED
          : sanitizeValue(item, seen, depth + 1);
      }
    } catch {
      return "[Unserializable value]";
    }
    return sanitized;
  }

  return String(value);
}

export function sanitizeLogData(value: unknown): unknown {
  return sanitizeValue(value, new WeakSet<object>(), 0);
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

function emit(
  method: "debug" | "info" | "warn" | "error",
  message: string,
  data?: unknown,
): void {
  if (!isDevelopment()) {
    return;
  }

  const prefix = `[SKETCHPLAN] ${message}`;
  if (data === undefined) {
    console[method](prefix);
    return;
  }
  console[method](prefix, sanitizeLogData(data));
}

export const logger = Object.freeze({
  debug(message: string, data?: unknown): void {
    emit("debug", message, data);
  },
  info(message: string, data?: unknown): void {
    emit("info", message, data);
  },
  warn(message: string, data?: unknown): void {
    emit("warn", message, data);
  },
  error(message: string, error?: unknown): void {
    emit("error", message, error);
  },
});
