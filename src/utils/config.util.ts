import 'dotenv/config';

class Config {
  private cache: Record<string, string | undefined> = {};
  load() {
    this.cache = { ...process.env } as Record<string, string | undefined>;
  }
  get(key: string, def?: string) {
    return this.cache[key] ?? def;
  }
  getBoolean(key: string, def?: boolean) {
    const v = this.get(key);
    if (v === undefined) return def ?? false;
    return v === '1' || v.toLowerCase() === 'true';
  }
  getNumber(key: string, def?: number) {
    const v = this.get(key);
    const num = v !== undefined ? Number(v) : NaN;
    return Number.isFinite(num) ? num : (def ?? NaN);
  }
}

export const config = new Config();
