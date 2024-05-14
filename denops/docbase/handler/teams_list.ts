// Team List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.4.3/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.4.3/buffer/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.4.3/variable/variable.ts";

import { Filetype, prepareViewer, setViewerContent } from "./buffer.ts";
import { Handler, openBuffer } from "../router.ts";
import type { Context, Params } from "../router.ts";

const pattern = new URLPattern({
  hostname: "teams",
  pathname: "",
});

export const TeamList: Handler = {
  accept(bufname: string) {
    return pattern.exec(bufname);
  },

  bufname(_props: Map<string, unknown>) {
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
        is.ObjectOf({ lnum: is.Number, mods: is.OptionalOf(is.String) }),
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
        params.mods,
      );
    },
  },
};
