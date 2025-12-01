import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createPapercutClient } from "../papercut.js";
import { config } from "../utils/config.util.js";
import { PAPERCUT_USER_PROPERTIES } from "../utils/papercut.user-properties.js";

export default {
  registerTools(server: McpServer) {
    // Registro de herramientas PaperCut usando el formato server.registerTool(...)

    const GetTotalUsersArgs = z.object({});
    server.registerTool(
      "papercut_get_total_users",
      {
        title: "PaperCut Get Total Users",
        description:
          "Returns the total number of users via api.getTotalUsers.",
        inputSchema: GetTotalUsersArgs,
      },
      async () => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const totalUsers = await client.call<number>("api.getTotalUsers");
          return { content: [{ type: "text", text: JSON.stringify({ totalUsers }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    const UserPropertyEnum = z.enum(PAPERCUT_USER_PROPERTIES as unknown as [string, ...string[]]);
    const GetUserPropertyArgs = z.object({
      username: z.string(),
      // Allow any string, but suggest the documented set via enum
      property: z.union([UserPropertyEnum, z.string().min(1)])
        .describe(
          "Nombre de propiedad de usuario. Sugeridos: " + PAPERCUT_USER_PROPERTIES.join(", ") +
          ". Ver guía: https://www.papercut.com/help/manuals/ng-mf/common/tools-web-services/"
        ),
    });
    server.registerTool(
      "papercut_get_user_property",
      {
        title: "PaperCut Get User Property",
        description: "Obtiene una propiedad de usuario (api.getUserProperty).",
        inputSchema: GetUserPropertyArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const value = await client.call<string>("api.getUserProperty", [args.username, args.property]);
          return { content: [{ type: "text", text: JSON.stringify({ value }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // Get multiple user properties at once
    const GetUserPropertiesArgs = z.object({
      username: z.string(),
      properties: z.array(z.union([UserPropertyEnum, z.string().min(1)])).min(1),
    });
    server.registerTool(
      "papercut_get_user_properties",
      {
        title: "PaperCut Get User Properties",
        description: "Obtiene múltiples propiedades de usuario (api.getUserProperties).",
        inputSchema: GetUserPropertiesArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const values = await client.call<unknown[]>("api.getUserProperties", [args.username, args.properties]);
          const mapped = Object.fromEntries(args.properties.map((p: string, i: number) => [p, values?.[i] ?? null]));
          return { content: [{ type: "text", text: JSON.stringify({ values: mapped }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // List printers with paging: api.listPrinters(offset, limit)
    const ListPrintersArgs = z.object({
      offset: z.number().int().min(0).describe("Starting index (0-based)."),
      limit: z.number().int().min(1).describe("Batch size (recommended up to 1000)."),
    });
    server.registerTool(
      "papercut_list_printers",
      {
        title: "PaperCut List Printers",
        description: "List printers (paged) via api.listPrinters(offset, limit).",
        inputSchema: ListPrintersArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const printers = await client.call<string[]>("api.listPrinters", [args.offset, args.limit]);
          return { content: [{ type: "text", text: JSON.stringify({ printers }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // List available (documented) user properties
    const ListUserPropsArgs = z.object({});
    server.registerTool(
      "papercut_list_user_properties",
      {
        title: "PaperCut List User Properties",
        description: "Lista local de propiedades de usuario documentadas (sin llamada al servidor).",
        inputSchema: ListUserPropsArgs,
      },
      async () => {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                properties: PAPERCUT_USER_PROPERTIES,
                doc: "https://www.papercut.com/help/manuals/ng-mf/common/tools-web-services/",
              }),
            },
          ],
        } as any;
      }
    );

    // Get user's total stats (lifetime totals): pages and jobs
    const GetUserStatsTotalArgs = z.object({ username: z.string() });
    server.registerTool(
      "papercut_get_user_stats_total",
      {
        title: "PaperCut Get User Stats (Total)",
        description: "Obtiene contadores totales de usuario: páginas y trabajos impresos.",
        inputSchema: GetUserStatsTotalArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const props = ["print-stats.page-count", "print-stats.job-count"];
          const values = await client.call<(string | number)[]>("api.getUserProperties", [args.username, props]);
          const [pageCountRaw, jobCountRaw] = values ?? [];
          const pageCount = Number(pageCountRaw ?? 0);
          const jobCount = Number(jobCountRaw ?? 0);
          return { content: [{ type: "text", text: JSON.stringify({ pageCount, jobCount }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // Get user account balance (optionally for a named account, defaults to primary)
    const GetUserAccountBalanceArgs = z.object({
      username: z.string(),
      accountName: z.string().optional().describe("Optional. Defaults to primary if omitted."),
    });
    server.registerTool(
      "papercut_get_user_account_balance",
      {
        title: "PaperCut Get User Account Balance",
        description: "Obtiene el balance de la cuenta del usuario (primaria por defecto).",
        inputSchema: GetUserAccountBalanceArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const params = args.accountName ? [args.username, args.accountName] : [args.username];
          const balance = await client.call<number>("api.getUserAccountBalance", params);
          return { content: [{ type: "text", text: JSON.stringify({ balance }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // List user accounts (paged)
    const ListUserAccountsArgs = z.object({
      offset: z.number().int().min(0),
      limit: z.number().int().min(1),
    });
    server.registerTool(
      "papercut_list_user_accounts",
      {
        title: "PaperCut List User Accounts",
        description: "Lista cuentas de usuario (paginado) vía api.listUserAccounts(offset, limit).",
        inputSchema: ListUserAccountsArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const users = await client.call<string[]>("api.listUserAccounts", [args.offset, args.limit]);
          return { content: [{ type: "text", text: JSON.stringify({ users }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // Get user groups for a username
    const GetUserGroupsArgs = z.object({ username: z.string() });
    server.registerTool(
      "papercut_get_user_groups",
      {
        title: "PaperCut Get User Groups",
        description: "Devuelve los grupos a los que pertenece un usuario.",
        inputSchema: GetUserGroupsArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const groups = await client.call<string[]>("api.getUserGroups", [args.username]);
          return { content: [{ type: "text", text: JSON.stringify({ groups }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // Get a printer property
    const GetPrinterPropertyArgs = z.object({
      serverName: z.string(),
      printerName: z.string(),
      property: z.string(),
    });
    server.registerTool(
      "papercut_get_printer_property",
      {
        title: "PaperCut Get Printer Property",
        description: "Obtiene una propiedad de impresora (api.getPrinterProperty).",
        inputSchema: GetPrinterPropertyArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const value = await client.call<string>("api.getPrinterProperty", [args.serverName, args.printerName, args.property]);
          return { content: [{ type: "text", text: JSON.stringify({ value }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );

    // Get members of a group (paged)
    const GetGroupMembersArgs = z.object({
      groupName: z.string(),
      offset: z.number().int().min(0),
      limit: z.number().int().min(1),
    });
    server.registerTool(
      "papercut_get_group_members",
      {
        title: "PaperCut Get Group Members",
        description: "Lista los miembros de un grupo (paginado) vía api.getGroupMembers.",
        inputSchema: GetGroupMembersArgs,
      },
      async (args: any) => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          const members = await client.call<string[]>("api.getGroupMembers", [args.groupName, args.offset, args.limit]);
          return { content: [{ type: "text", text: JSON.stringify({ members }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: err?.message || String(err) }) }] } as any;
        }
      }
    );
  },
};
