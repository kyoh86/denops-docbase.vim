import {
  ensure,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Response, ResponseWithBody } from "./types.ts";

const API_URL = "https://api.docbase.io";

export class Fetcher {
  constructor(
    private readonly apiToken: string,
    private readonly domain: string,
  ) {}

  private headers() {
    return {
      "X-DocBaseToken": this.apiToken,
      "Content-Type": "application/json",
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
      body: asBody ? ensure(await raw.json(), asBody) : undefined, // TODO: use unknownutil
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
