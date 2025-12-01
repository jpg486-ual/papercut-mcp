import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Logger } from "./utils/logger.util.js";
import { config } from "./utils/config.util.js";
import { VERSION, PACKAGE_NAME } from "./utils/constants.util.js";
import papercutApi from "./tools/papercut.api.tool.js";

const NAME = PACKAGE_NAME;
const indexLogger = Logger.forContext("index.ts");

async function main() {
  // Load configuration
  config.load();
  const transport = new StdioServerTransport();
  const server = new McpServer({ name: NAME, version: VERSION });

  // Register tools
  papercutApi.registerTools(server);

  indexLogger.info(`Starting ${NAME} v${VERSION} on STDIO`);
  await server.connect(transport);
}

main().catch((e) => {
  indexLogger.error("Unhandled error in main process", e);
  process.exit(1);
});
