# papercut-mcp

Servidor MCP (Model Context Protocol) en TypeScript que expone herramientas basadas en la API XML Web Services (XML‑RPC) de PaperCut NG/MF.

> Aviso: Proyecto en desarrollo activo. Se agradecen issues y pull requests para seguir mejorándolo.

## Requisitos
- Node.js 18+
- PaperCut NG/MF con Web Services habilitado
  - Configurar `auth.webservices.auth-token` en el admin
  - Añadir tu IP a “Allowed XML Web Services callers” si no es localhost

## Instalación

```powershell
# En PowerShell (Windows)
Set-Location "c:\Users\jeperez\repos\papercut-mcp"
Copy-Item .env.example .env
# Edita .env y rellena PAPERCUT_XMLRPC_URL y PAPERCUT_AUTH_TOKEN
npm install
npm run build
```

## Ejecución local

```powershell
npm run start
```

El servidor corre por stdio (no abre puerto). Normalmente lo invocará un cliente MCP (p. ej., Cursor).

## Configuración de Cursor (ejemplo)
En la configuración de Cursor (User Settings JSON), añade algo como:

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

## Herramientas disponibles
- `papercut_ping`: Comprueba conectividad usando `api.getTotalUsers` (solo token). Devuelve `{ ok, totalUsers }`.
- `papercut_get_user_property`: Llama a `api.getUserProperty(username, property)`. Devuelve `{ value }`.
- `papercut_get_user_properties`: Llama a `api.getUserProperties(username, properties[])`. Devuelve `{ values: {prop: valor} }`.
- `papercut_list_user_properties`: Devuelve una lista local de propiedades de usuario documentadas (no llama al servidor).

Nota: Los nombres exactos de propiedades y permisos dependen de tu instalación. Documentación oficial: https://www.papercut.com/help/manuals/ng-mf/common/tools-web-services/

## Variables de entorno
- `PAPERCUT_XMLRPC_URL` (p. ej. `http://localhost:9191/rpc/api/xmlrpc` o `https://<host>:9192/rpc/api/xmlrpc`)
- `PAPERCUT_AUTH_TOKEN` (obligatoria)
- `PAPERCUT_TIMEOUT_MS` (opcional, por defecto `10000`)

## Desarrollo

```powershell
npm run dev
```

Edita los ficheros en `src/`. Las herramientas MCP están en `src/tools/papercut.api.tool.ts` y el cliente XML‑RPC en `src/papercut.ts`.
