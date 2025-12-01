import { Logger } from "../utils/logger.util.js";

export async function runCli(args: string[]) {
  const logger = Logger.forContext("cli/index.ts", "runCli");
  logger.info("CLI not implemented yet", args);
}
