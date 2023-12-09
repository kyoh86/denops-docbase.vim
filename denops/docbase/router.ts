import type { Denops } from "https://deno.land/x/denops_std@v5.1.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.1.0/function/mod.ts";

import type { Opener } from "./types.ts";
import type { StateMan } from "./state.ts";
import { TeamList } from "./handler/teams_list.ts";
import { PostList } from "./handler/posts_list.ts";
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

const handlers: Record<string, Handler> = {
  TeamList: TeamList,
  PostList: PostList,
  NewPost: NewPost,
  Post: Post,
};

function routing(bufname: string) {
  for (const key in handlers) {
    const handler = handlers[key];
    const match = handler.accept(bufname);
    if (match && match.protocol.input == "docbase") { // NOTE: protocol matching is not working
      return { match, handler };
    }
  }
  throw new Error(`There's no valid handler for ${bufname}`);
}

export async function openBuffer(
  denops: Denops,
  handler: string,
  props: Record<string, unknown>,
  opener: Opener = "edit",
) {
  const h = handlers[handler];
  if (!h) {
    throw new Error(`There's no handler ${handler}`);
  }
  const bufname = h.bufname(props);
  await denops.cmd(`${opener} ${bufname}`);
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
