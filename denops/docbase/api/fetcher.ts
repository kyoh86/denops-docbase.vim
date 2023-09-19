import {
  ensure,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { getLogger } from "https://deno.land/std@0.200.0/log/mod.ts";
import { Response, ResponseWithBody } from "./types.ts";

const API_URL = "https://api.docbase.io";

async function parseJSONResponse(response: globalThis.Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    getLogger("denops-docbase").error(
      "Failed to parse response as JSON. Call :DocbaseLog for details",
    );
    getLogger("denops-docbase-verbose").debug(err);
    getLogger("denops-docbase-verbose").debug(text);
  }
}

export class Fetcher {
  constructor(
    private readonly apiToken: string,
    private readonly domain: string,
  ) {}

  private headers() {
    return {
      "X-DocBaseToken": this.apiToken,
      "Content-Type": "application/json",
      "User-Agent": `denops-docbase.vim`,
    };
  }

  private async core<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody: undefined,
    params?: {
      query?: Record<string, string>;
      body?: unknown;
    },
  ): Promise<Response>;

  private async core<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody: P<T>,
    params?: {
      query?: Record<string, string>;
      body?: unknown;
    },
  ): Promise<ResponseWithBody<T>>;

  private async core<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody?: P<T>,
    params?: {
      query?: Record<string, string>;
      body?: unknown;
    },
  ) {
    const url = new URL(`${API_URL}/teams/${this.domain}${path}`);
    if (params?.query) {
      for (const key in params.query) {
        url.searchParams.append(key, params?.query[key]);
      }
    }
    const raw = await fetch(
      url,
      {
        method,
        headers: this.headers(),
        body: params?.body ? JSON.stringify(params.body) : undefined,
      },
    );
    return {
      headers: raw.headers,
      ok: raw.ok,
      redirected: raw.redirected,
      status: raw.status,
      statusText: raw.statusText,
      type: raw.type,
      url: raw.url,
      ...((raw.ok)
        ? {
          body: asBody
            ? ensure(await parseJSONResponse(raw), asBody)
            : undefined,
        }
        : {
          error: await raw.text(),
          body: {},
        }),
    };
  }

  request<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody: P<T>,
    params?: {
      query?: Record<string, string>;
      body?: unknown;
    },
  ) {
    return this.core<T>(method, path, asBody, params);
  }

  call<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    path: string,
    params?: {
      query?: Record<string, string>;
      body?: unknown;
    },
  ) {
    return this.core<T>(method, path, undefined, params);
  }
}
