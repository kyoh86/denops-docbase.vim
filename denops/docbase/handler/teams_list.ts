// Team List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v6.5.0/batch/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";

import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import type {
  Buffer,
  Router,
} from "https://denopkg.com/kyoh86/denops-router@v0.0.1-alpha.2/mod.ts";
import { Filetype } from "./filetype.ts";
import { StateMan } from "../state.ts";

export async function loadTeamsList(
  denops: Denops,
  state: StateMan,
  buf: Buffer,
) {
  const domains = await state.domains();
  await buffer.ensure(denops, buf.bufnr, async () => {
    await batch(denops, async (denops) => {
      await variable.b.set(denops, "docbase_teams_list_items", domains);
      await buffer.replace(denops, buf.bufnr, domains);
      await option.filetype.setLocal(denops, Filetype.TeamsList);
      await option.modified.setLocal(denops, false);
      await option.readonly.setLocal(denops, true);
    });
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
  await router.open(denops, "posts-list", params.mods, {
    domain: domains[params.lnum - 1],
  });
}
