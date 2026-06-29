import { type TeledexRecord } from './teledexRecord';

export class TeledexBuffer {
  private records: TeledexRecord[] = [];

  public constructor(private maxRecords: number) {}

  public push(record: TeledexRecord): void {
    this.records.push(record);
    this.trim();
  }

  public size(): number {
    return this.records.length;
  }

  public setMax(maxRecords: number): void {
    this.maxRecords = Math.max(0, maxRecords | 0);
    this.trim();
  }

  public all(): TeledexRecord[] {
    return [...this.records];
  }

  public tail(n = this.records.length): TeledexRecord[] {
    return this.records.slice(Math.max(0, this.records.length - Math.max(0, n)));
  }

  public filter(predicate: { level?: number; scope?: string; text?: string }): TeledexRecord[] {
    const scope = predicate.scope?.toLowerCase();
    const text = predicate.text?.toLowerCase();

    return this.records.filter((r) => (
      (predicate.level == null || r.value >= predicate.level)
        && (!scope || r.scope.toLowerCase().includes(scope))
        && (!text || JSON.stringify(r.args).toLowerCase().includes(text))
    ));
  }

  public clear(): void {
    this.records = [];
  }

  private trim(): void {
    if (this.records.length > this.maxRecords) {
      this.records.splice(0, this.records.length - this.maxRecords);
    }
  }
}
