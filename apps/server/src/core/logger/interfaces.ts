export interface ILoggerPayload {
  message: string;
  [x: string | number | symbol]: unknown;
}

export interface ILoggerErrorPayload extends ILoggerPayload {
  error?: Error;
  trace?: string;
}
