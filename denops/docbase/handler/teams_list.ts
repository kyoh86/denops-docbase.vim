// Team List Buffer

import type { Denops } from "jsr:@denops/std@7.0.1";
import { batch } from "jsr:@denops/std@7.0.1/batch";
import * as buffer from "jsr:@denops/std@7.0.1/buffer";
import * as variable from "jsr:@denops/std@7.0.1/variable";
import * as option from "jsr:@denops/std@7.0.1/option";

import { ensure, is } from "jsr:@core/unknownutil@3.18.1";
import type { Buffer, Router } from "jsr:@kyoh86/denops-router@0.0.1";
import { Filetype } from "./filetype.ts";
import type { StateMan } from "../state.ts";

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
