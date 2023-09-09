import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";

import { StateMan } from "./state.ts";

import { TeamList } from "./handler/team_list.ts";
import { PostList } from "./handler/post_list.ts";
import { Post } from "./handler/post.ts";

export interface Handler {
  load(denops: Denops, bufNr: number): Promise<void>;
  save?(denops: Denops, bufNr: number): Promise<void>;
}

type HandlerConstructor = (
  stateManager: StateMan,
  groups: Record<string, string | undefined> | undefined,
) => Handler;

function handle(
  pathPattern: string,
  handlerConstructor: HandlerConstructor,
) {
  const urlPattern = new RegExp(`docbase://${pathPattern}`);
  return (stateMan: StateMan, bufName: string) => {
    const match = urlPattern.exec(bufName);
    if (match) {
      return handlerConstructor(stateMan, match.groups);
    }
    return;
  };
}

export const router = [
  handle(
    "teams/(?<domain>\\w+)/posts/(?<postId>\\d+)",
    Post.new,
  ),
  handle(
    "teams/(?<domain>\\w+)/posts",
    PostList.new,
  ),
  handle(
    "teams",
    TeamList.new,
  ),
];

export function getHandler(stateMan: StateMan, bufName: string) {
  for (const r of router) {
    const p = r(stateMan, bufName);
    if (!p) {
      continue;
    }
    return p;
  }

  throw new Error(`There's no valid handler for ${bufName}`);
}
