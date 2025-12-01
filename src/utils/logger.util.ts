type Context = { file?: string; scope?: string };

export class Logger {
  static forContext(file?: string, scope?: string) {
    return new ContextLogger({ file, scope });
  }
}

class ContextLogger {
  constructor(private ctx: Context) {}
  private prefix(level: string) {
    const parts = ["[papercut-mcp]", level];
    if (this.ctx.file) parts.push(this.ctx.file);
    if (this.ctx.scope) parts.push(this.ctx.scope);
    return parts.join(" ");
  }
  debug(...args: unknown[]) { console.debug(this.prefix("DEBUG"), ...args); }
  info(...args: unknown[]) { console.info(this.prefix("INFO"), ...args); }
  warn(...args: unknown[]) { console.warn(this.prefix("WARN"), ...args); }
  error(...args: unknown[]) { console.error(this.prefix("ERROR"), ...args); }
}
