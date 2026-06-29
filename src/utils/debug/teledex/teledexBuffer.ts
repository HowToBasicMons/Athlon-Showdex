import { type TeledexRecord } from './teledexRecord';

/**
 * Capped in-memory ring buffer for Teledex records.
 *
 * Eviction is **amortized O(1)**: `Array.prototype.splice(0, n)` shifts every remaining element (O(n)),
 * so trimming on every `push()` would be death-by-a-thousand-shifts during a live battle's log firehose.
 * Instead we let the backing array overshoot the cap by `trimSlack` and compact the whole overflow in a
 * single splice once per ~`trimSlack` pushes. Reads return the capped view (last `maxRecords`), so the
 * external cap stays exact.
 */
export class TeledexBuffer {
  private records: TeledexRecord[] = [];

  /** how far the backing array may overshoot `maxRecords` before a compaction splice (amortization slack). */
  private static readonly trimSlack = 256;

  public constructor(private maxRecords: number) {}

  public push(record: TeledexRecord): void {
    this.records.push(record);

    if (this.records.length > this.maxRecords + TeledexBuffer.trimSlack) {
      this.records.splice(0, this.records.length - this.maxRecords);
    }
  }

  public size(): number {
    return Math.min(this.records.length, this.maxRecords);
  }

  public setMax(maxRecords: number): void {
    this.maxRecords = Math.max(0, maxRecords | 0);

    // setMax is infrequent (config change) -> compact exactly now
    if (this.records.length > this.maxRecords) {
      this.records.splice(0, this.records.length - this.maxRecords);
    }
  }

  /** the last `maxRecords` records (the canonical, cap-exact view that reads operate on). */
  private capped(): TeledexRecord[] {
    return this.records.length > this.maxRecords
      ? this.records.slice(this.records.length - this.maxRecords)
      : this.records;
  }

  public all(): TeledexRecord[] {
    return [...this.capped()];
  }

  public tail(n = this.maxRecords): TeledexRecord[] {
    const view = this.capped();

    return view.slice(Math.max(0, view.length - Math.max(0, n)));
  }

  public filter(predicate: { level?: number; scope?: string; text?: string }): TeledexRecord[] {
    const scope = predicate.scope?.toLowerCase();
    const text = predicate.text?.toLowerCase();

    return this.capped().filter((r) => (
      (predicate.level == null || r.value >= predicate.level)
        && (!scope || r.scope.toLowerCase().includes(scope))
        && (!text || JSON.stringify(r.args).toLowerCase().includes(text))
    ));
  }

  public clear(): void {
    this.records = [];
  }
}
