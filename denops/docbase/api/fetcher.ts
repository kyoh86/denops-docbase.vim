import { ensure, Predicate as P } from "jsr:@core/unknownutil@3.18.1";
import { getLogger } from "jsr:@std/log@0.224.4";
import { Response, ResponseWithBody } from "./types.ts";
import { Stringer } from "./types.ts";

const API_URL = "https://api.docbase.io";

async function parseJSONResponse(response: globalThis.Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    getLogger("denops-docbase").error("Failed to parse response as JSON");
    getLogger("denops-docbase-verbose").debug(err);
    getLogger("denops-docbase-verbose").debug(text);
  }
}

async function parseTextResponse(response: globalThis.Response) {
  if (response.body == null) {
    return undefined;
  }
  return await response.text();
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
      query?: Map<string, Stringer | string>;
      body?: unknown;
    },
  ): Promise<Response>;

  private async core<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody: P<T>,
    params?: {
      query?: Map<string, Stringer | string>;
      body?: unknown;
    },
  ): Promise<ResponseWithBody<T>>;

  private async core<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody?: P<T>,
    params?: {
      query?: Map<string, Stringer | string>;
      body?: unknown;
    },
  ): Promise<Response | ResponseWithBody<T>> {
    const url = new URL(`${API_URL}/teams/${this.domain}${path}`);
    if (params?.query) {
      for (const entry of params.query.entries()) {
        const key = entry[0];
        const value = (typeof entry[1] === "string")
          ? entry[1]
          : entry[1].toString();
        url.searchParams.append(key, value);
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
          error: await parseTextResponse(raw),
          body: {},
        }),
    };
  }

  request<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
    path: string,
    asBody: P<T>,
    params?: {
      query?: Map<string, Stringer | string>;
      body?: unknown;
    },
  ) {
    return this.core<T>(method, path, asBody, params);
  }

  call<T>(
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    path: string,
    params?: {
      query?: Map<string, Stringer | string>;
      body?: unknown;
    },
  ) {
    return this.core<T>(method, path, undefined, params);
  }
}
