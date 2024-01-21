// Team List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v5.3.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.3.0/buffer/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v5.3.0/variable/variable.ts";

import { Filetype, prepareViewer, setViewerContent } from "./buffer.ts";
import { Handler, openBuffer } from "../router.ts";
import type { Context, Params } from "../router.ts";
import { isOpener } from "../types.ts";

const pattern = new URLPattern({
  hostname: "teams",
  pathname: "",
});

export const TeamList: Handler = {
  accept(bufname: string) {
    return pattern.exec(bufname);
  },

  bufname(_props: Record<string, unknown>) {
    return "docbase://teams";
  },

  async load(denops: Denops, context: Context) {
    await buffer.ensure(denops, context.bufnr, async () => {
      await prepareViewer(denops, Filetype.TeamList);

      const domains = await context.state.domains();
      await variable.b.set(denops, "docbase_teams_list_items", domains);

      await setViewerContent(denops, context.bufnr, domains);
    });
  },

  act: {
    async open(denops: Denops, _context: Context, _params: Params) {
      const params = ensure(
        _params,
        is.ObjectOf({ lnum: is.Number, opener: is.OptionalOf(isOpener) }),
      );
      const domains = ensure(
        await variable.b.get(
          denops,
          "docbase_teams_list_items",
        ),
        is.ArrayOf(is.String),
      );
      await openBuffer(
        denops,
        "PostList",
        { domain: domains[params.lnum - 1] },
        params.opener,
      );
    },
  },
};
