import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createPapercutClient } from "../papercut.js";
import { config } from "../utils/config.util.js";
import { PAPERCUT_USER_PROPERTIES } from "../utils/papercut.user-properties.js";

export default {
  registerTools(server: McpServer) {
    // Registro de herramientas PaperCut usando el formato server.registerTool(...)

    const PingArgs = z.object({});
    server.registerTool(
      "papercut_ping",
      {
        title: "PaperCut Ping",
        description:
          "Comprueba conectividad llamando a api.getTotalUsers (token-only).",
        inputSchema: PingArgs,
      },
      async () => {
        const xmlrpcUrl = config.get("PAPERCUT_XMLRPC_URL", "http://localhost:9191/rpc/api/xmlrpc")!;
        const authToken = config.get("PAPERCUT_AUTH_TOKEN", "")!;
        const timeoutMs = config.getNumber("PAPERCUT_TIMEOUT_MS", 10000)!;
        try {
          const client = await createPapercutClient({ xmlrpcUrl, authToken, timeoutMs });
          // Método documentado sin parámetros adicionales: api.getTotalUsers
          const totalUsers = await client.call<number>("api.getTotalUsers");
          return { content: [{ type: "text", text: JSON.stringify({ ok: true, totalUsers }) }] } as any;
        } catch (err: any) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: err?.message || String(err) }) }] } as any;
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
  },
};
