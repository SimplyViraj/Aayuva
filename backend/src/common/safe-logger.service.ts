import { Injectable, LoggerService } from '@nestjs/common';

export interface DiagnosticEvent {
  event: 'http_error' | 'framework_event';
  level: 'info' | 'warn' | 'error' | 'debug';
  requestId?: string;
  status?: number;
}

@Injectable()
export class SafeLogger implements LoggerService {
  event(event: DiagnosticEvent): void {
    const entry = {
      timestamp: new Date().toISOString(),
      event: event.event,
      level: event.level,
      requestId: event.requestId,
      status: event.status,
    };
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }

  // Nest/provider error messages, traces and contextual arguments are untrusted.
  // Keep framework diagnostics categorized instead of logging raw strings/objects.
  log(message: unknown): void { void message; this.framework('info'); }
  warn(message: unknown): void { void message; this.framework('warn'); }
  error(message: unknown): void { void message; this.framework('error'); }
  debug(message: unknown): void { void message; this.framework('debug'); }
  verbose(message: unknown): void { void message; this.framework('debug'); }
  fatal(message: unknown): void { void message; this.framework('error'); }

  private framework(level: DiagnosticEvent['level']): void {
    this.event({ event: 'framework_event', level });
  }
}
