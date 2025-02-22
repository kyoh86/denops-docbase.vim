// Team List Buffer

import type { Denops } from "jsr:@denops/std@~7.5.0";
import { batch } from "jsr:@denops/std@~7.5.0/batch";
import * as buffer from "jsr:@denops/std@~7.5.0/buffer";
import * as variable from "jsr:@denops/std@~7.5.0/variable";
import * as option from "jsr:@denops/std@~7.5.0/option";

import { as, ensure, is } from "jsr:@core/unknownutil@~4.3.0";
import {
  type Buffer,
  isBufferOpener,
  type Router,
} from "jsr:@kyoh86/denops-router@~0.4.0";
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
      await option.bufhidden.setLocal(denops, "wipe");
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
    is.ObjectOf({ lnum: is.Number, open_option: as.Optional(isBufferOpener) }),
  );
  const domains = ensure(
    await variable.b.get(
      denops,
      "docbase_teams_list_items",
    ),
    is.ArrayOf(is.String),
  );
  await router.open(
    denops,
    "posts-list",
    {
      domain: domains[params.lnum - 1],
    },
    undefined,
    params.open_option,
  );
}
