export interface Logger {
  warn(message: string, meta?: Record<string, unknown>): void;
}
