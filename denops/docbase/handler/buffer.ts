import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v6.5.0/batch/mod.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";

export enum Filetype {
  TeamList = "docbase_teams_list",
  PostList = "docbase_posts_list",
  Post = "docbase_post.markdown",
  NewPost = "docbase_new_post.markdown",
}

export async function setViewerContent(
  denops: Denops,
  bufnr: number,
  ft: Filetype,
  lines: string[],
) {
  await buffer.ensure(denops, bufnr, async () => {
    await batch(denops, async (denops) => {
      await buffer.replace(denops, bufnr, lines);

      await option.filetype.setLocal(denops, ft);
      await option.modified.setLocal(denops, false);
      await option.readonly.setLocal(denops, true);
    });
  });
}
