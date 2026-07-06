export type BotServiceName = "pfp" | "whatsapp";

export interface BotServiceConfig {
  name: BotServiceName;
  baseUrl: string;
  token: string;
  ownerId: string;
}

export interface BotProxyResult<T = unknown> {
  connected: boolean;
  data?: T;
  error?: string;
}

function cleanBaseUrl(value?: string) {
  return (value || "").trim().replace(/\/+$/, "");
}

export function getBotServiceConfig(name: BotServiceName): BotServiceConfig | null {
  const prefix = name === "pfp" ? "PFP_BOT" : "WHATSAPP_BOT";
  const baseUrl = cleanBaseUrl(process.env[`${prefix}_API_URL`]);
  const token = process.env[`${prefix}_API_TOKEN`] || "";
  const ownerId = process.env[`${prefix}_OWNER_ID`] || process.env.PAPPY_DEFAULT_OWNER_ID || "pappy999666";

  if (!baseUrl || !token) return null;
  return { name, baseUrl, token, ownerId };
}

export async function callBotService<T = unknown>(
  service: BotServiceName,
  endpoint: string,
  payload?: unknown,
): Promise<BotProxyResult<T>> {
  const config = getBotServiceConfig(service);
  if (!config) {
    return { connected: false, error: `${service} bot API is not configured.` };
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: payload === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.token}`,
      "X-Pappy-Owner": config.ownerId,
      "X-Pappy-Service": service,
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    return { connected: true, error: typeof data === "string" ? data : JSON.stringify(data) };
  }

  return { connected: true, data: data as T };
}
