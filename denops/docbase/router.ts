import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v6.5.0/function/mod.ts";

import type { StateMan } from "./state.ts";
import { NewPost } from "./handler/new_post.ts";
import { Post } from "./handler/post.ts";

export interface Context {
  state: StateMan;
  match: URLPatternResult;
  bufnr: number;
  bufname: string;
}

export type Params = Record<string, unknown>;

export interface Handler {
  bufname(props: Record<string, unknown>): string;
  accept(bufname: string): URLPatternResult | null;
  load(denops: Denops, buf: Context): Promise<void>;
  act: Record<
    string,
    (denops: Denops, buf: Context, params: Params) => Promise<void>
  >;
}

const handlers = new Map<string, Handler>([
  ["NewPost", NewPost],
  ["Post", Post],
]);

function routing(bufname: string) {
  for (const handler of handlers.values()) {
    const match = handler.accept(bufname);
    if (match && match.protocol.input == "docbase") { // NOTE: protocol matching is not working
      return { match, handler };
    }
  }
  throw new Error(`There's no valid handler for ${bufname}`);
}

function modsOpener(mods: string): string {
  for (const mod of mods.split(/\s+/).reverse()) {
    switch (mod) {
      case "vert":
        return "vnew";
      case "verti":
        return "vnew";
      case "vertic":
        return "vnew";
      case "vertica":
        return "vnew";
      case "vertical":
        return "vnew";
      case "hor":
        return "new";
      case "hori":
        return "new";
      case "horiz":
        return "new";
      case "horizo":
        return "new";
      case "horizon":
        return "new";
      case "horizont":
        return "new";
      case "horizonta":
        return "new";
      case "horizontal":
        return "new";
      case "tab":
        return "tabnew";
    }
  }
  return "edit";
}
export async function openBuffer(
  denops: Denops,
  handler: string,
  props: Record<string, unknown>,
  mods: string = "",
) {
  const h = handlers.get(handler);
  if (!h) {
    throw new Error(`There's no handler ${handler}`);
  }
  const bufname = h.bufname(props);
  const opener = modsOpener(mods);
  await denops.cmd(`${mods} ${opener} ${bufname}`);
}

export async function bufferLoaded(
  denops: Denops,
  state: StateMan,
  bufnr: number,
) {
  const bufname = await fn.bufname(denops, bufnr);
  const { match, handler } = routing(bufname);
  await handler.load(denops, { bufnr, bufname, match, state });
}

export async function bufferAction(
  denops: Denops,
  state: StateMan,
  bufnr: number,
  actName: string,
  params: Params,
) {
  const bufname = await fn.bufname(denops, bufnr);
  const { match, handler } = routing(bufname);
  const action = handler.act[actName];
  if (!action) {
    throw new Error(`There's no valid action ${actName} for ${bufname}`);
  }
  await action(denops, { bufnr, bufname, match, state }, params);
}
