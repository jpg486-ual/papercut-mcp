# papercut-mcp

TypeScript MCP (Model Context Protocol) server exposing tools backed by the PaperCut NG/MF XML Web Services (XML‑RPC) API.

> Status: Actively developed. Issues and pull requests are welcome!

## Requirements
- Node.js 18+
- PaperCut NG/MF with Web Services enabled
  - Set `auth.webservices.auth-token` in the admin interface
  - Add your caller IP under “Allowed XML Web Services callers” if not localhost

## Installation

```powershell
# On PowerShell (Windows)
Set-Location "c:\Users\jeperez\repos\papercut-mcp"
Copy-Item .env.example .env
# Edit .env to set PAPERCUT_XMLRPC_URL and PAPERCUT_AUTH_TOKEN
npm install
npm run build
```

## Local run

```powershell
npm run start
```

The server communicates over stdio (no listening port). It’s typically launched by an MCP client (e.g., Cursor).

## Cursor configuration (example)
In Cursor User Settings (JSON), add something like:

```json
{
  "mcpServers": {
    "papercut": {
      "command": "node",
      "args": [
        "c:\\Users\\jeperez\\repos\\papercut-mcp\\dist\\index.js"
      ],
      "env": {
        "PAPERCUT_XMLRPC_URL": "http://localhost:9191/rpc/api/xmlrpc",
        "PAPERCUT_AUTH_TOKEN": "REPLACE_WITH_YOUR_TOKEN",
        "PAPERCUT_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Available tools
- `papercut_get_total_users`: Returns the total number of users via `api.getTotalUsers`. Returns `{ totalUsers }`.
- `papercut_get_user_property`: Calls `api.getUserProperty(username, property)`. Returns `{ value }`.
- `papercut_get_user_properties`: Calls `api.getUserProperties(username, properties[])`. Returns `{ values: { property: value } }`.
- `papercut_list_user_properties`: Returns a local list of documented user properties (no server call).

Note: Exact property names and permissions depend on your installation. Official docs: https://www.papercut.com/help/manuals/ng-mf/common/tools-web-services/

## Environment variables
- `PAPERCUT_XMLRPC_URL` (e.g., `http://localhost:9191/rpc/api/xmlrpc` or `https://<host>:9192/rpc/api/xmlrpc`)
- `PAPERCUT_AUTH_TOKEN` (required)
- `PAPERCUT_TIMEOUT_MS` (optional, default `10000`)

## Development

```powershell
npm run dev
```

Edit files in `src/`. MCP tools live in `src/tools/papercut.api.tool.ts` and the XML‑RPC client in `src/papercut.ts`.
