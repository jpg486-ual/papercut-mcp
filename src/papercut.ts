import xmlrpc from "xmlrpc";

export interface PapercutConfig {
  xmlrpcUrl: string; // e.g., https://server:9192/rpc/api/xmlrpc
  authToken: string;
  timeoutMs?: number;
}

export interface PapercutClient {
  call<T = any>(method: string, params?: any[]): Promise<T>;
}

function createXmlRpcClient(url: string, timeoutMs: number) {
  const u = new URL(url);
  const isHttps = u.protocol === "https:";
  const client = isHttps
    ? xmlrpc.createSecureClient({ host: u.hostname, port: Number(u.port) || 443, path: u.pathname, timeout: timeoutMs })
    : xmlrpc.createClient({ host: u.hostname, port: Number(u.port) || 80, path: u.pathname, timeout: timeoutMs });
  return client;
}

export async function createPapercutClient(config: PapercutConfig): Promise<PapercutClient> {
  const client = createXmlRpcClient(config.xmlrpcUrl, config.timeoutMs ?? 10000);
  const token = config.authToken;

  return {
    async call(method, params = []) {
      const finalParams = [token, ...params];
      return await new Promise<any>((resolve, reject) => {
        client.methodCall(method, finalParams, (err: any, value: any) => {
          if (err) return reject(err);
          resolve(value);
        });
      });
    },
  };
}
