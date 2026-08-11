import type { Logger } from "../../data/protocols/logger.js";

export class ConsoleLogger implements Logger {
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[smash-api] ${message}`, meta ?? {});
  }
}
