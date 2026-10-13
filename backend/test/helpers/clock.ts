// Explicit fixture time. Never registered in an application module.
export class FixtureClock {
  private milliseconds = Date.parse('2026-10-13T00:00:00Z');
  readonly now = (): number => this.milliseconds;
  advance(seconds: number): void { this.milliseconds += seconds * 1000; }
}
