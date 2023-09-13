import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import { group } from "https://deno.land/x/denops_std@v5.0.1/autocmd/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";

export enum Filetype {
  TeamList = "docbase_team_list",
  PostList = "docbase_post_list",
  Post = "docbase_post.markdown",
  PostNew = "docbase_post_new.markdown",
}

export async function prepareViewer(denops: Denops, ft: Filetype) {
  await batch(denops, async (denops) => {
    await option.swapfile.setLocal(denops, false);
    await option.modifiable.setLocal(denops, false);
    await option.bufhidden.setLocal(denops, "wipe");
    await option.filetype.setLocal(denops, ft);
  });
}

export async function setViewerContent(
  denops: Denops,
  bufnr: number,
  lines: string[],
) {
  await buffer.ensure(denops, bufnr, async () => {
    await batch(denops, async (denops) => {
      await buffer.replace(denops, bufnr, lines);

      await option.modified.setLocal(denops, false);
      await option.readonly.setLocal(denops, true);
    });
  });
}
export async function prepareProxy(
  denops: Denops,
  bufnr: number,
  ft: Filetype,
) {
  await buffer.ensure(denops, bufnr, async () => {
    await batch(denops, async (denops) => {
      await option.swapfile.setLocal(denops, false);
      await option.bufhidden.setLocal(denops, "unload");
      await option.buftype.setLocal(denops, "acwrite");
      await option.filetype.setLocal(denops, ft);
    });

    await group(denops, "docbase-writecmd", (helper) => {
      helper.remove("*", "<buffer>");
      helper.define(
        "BufWriteCmd",
        "<buffer>",
        `call denops#notify("${denops.name}", "bufferAction", [bufnr(), "save", {}])`,
      );
    });
  });
}
