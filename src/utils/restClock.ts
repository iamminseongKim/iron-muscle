/** Wall-clock based rest time. Integer milliseconds avoid tick rounding drift. */
export class RestClock {
  private at: number;
  private remainingMs: number;
  private elapsedMs: number;
  constructor(remaining: number, elapsed = 0, public running = true, now = Date.now()) {
    this.at = now;
    this.remainingMs = Math.round(remaining * 1000);
    this.elapsedMs = Math.round(elapsed * 1000);
  }
  get remaining() { return this.remainingMs / 1000; }
  set remaining(seconds: number) { this.remainingMs = Math.round(seconds * 1000); }
  get elapsed() { return this.elapsedMs / 1000; }
  sample(now = Date.now()) {
    if (this.running) {
      const delta = Math.max(0, now - this.at);
      this.remainingMs = Math.max(0, this.remainingMs - delta);
      this.elapsedMs += delta;
    }
    this.at = now;
    return { remaining: Math.ceil(this.remaining), elapsed: Math.floor(this.elapsed) };
  }
  pause(now = Date.now()) { this.sample(now); this.running = false; }
  resume(now = Date.now()) { this.at = now; this.running = true; }
}
