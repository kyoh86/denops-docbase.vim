// Team List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";

import type { Router } from "../../router/router.ts";
import { Filetype, prepareViewer, setViewerContent } from "./buffer.ts";
import { StateMan } from "../state.ts";
import { Buffer } from "../../router/types.ts";

export async function loadTeamsList(
  denops: Denops,
  state: StateMan,
  buf: Buffer,
) {
  await buffer.ensure(denops, buf.bufnr, async () => {
    await prepareViewer(denops, Filetype.TeamList);

    const domains = await state.domains();
    await variable.b.set(denops, "docbase_teams_list_items", domains);

    await setViewerContent(denops, buf.bufnr, domains);
  });
}

export async function openPostsList(
  denops: Denops,
  router: Router,
  uParams: Record<string, unknown>,
) {
  const params = ensure(
    uParams,
    is.ObjectOf({ lnum: is.Number, mods: is.OptionalOf(is.String) }),
  );
  const domains = ensure(
    await variable.b.get(
      denops,
      "docbase_teams_list_items",
    ),
    is.ArrayOf(is.String),
  );
  await router.open(denops, "posts", params.mods, {
    domain: domains[params.lnum - 1],
  });
}
