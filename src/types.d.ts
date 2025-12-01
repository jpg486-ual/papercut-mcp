declare module "@modelcontextprotocol/sdk/dist/esm/server/index.js" {
  export class Server {
    constructor(info: { name: string; version: string }, transport: any);
    connect(): Promise<void>;
    addTool(tool: any): void;
    close(): Promise<void>;
  }
}
declare module "@modelcontextprotocol/sdk/dist/esm/server/stdio.js" {
  export class StdioServerTransport {
    constructor(...args: any[]);
  }
}
declare module "@modelcontextprotocol/sdk/server/mcp.js" {
  export class McpServer {
    constructor(info: { name: string; version: string });
    connect(transport: any): Promise<void>;
    addTool(tool: any): void;
    tool(definition: any, handler: (...args: any[]) => Promise<any> | any): void;
    registerTool(
      name: string,
      meta: { title?: string; description?: string; inputSchema?: any },
      handler: (...args: any[]) => Promise<any> | any,
    ): void;
    close(): Promise<void>;
  }
}
declare module "xmlrpc" {
  const xmlrpc: any;
  export default xmlrpc;
}
