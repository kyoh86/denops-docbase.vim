// Team List Buffer

import type { Denops } from "@denops/std";
import { batch } from "@denops/std/batch";
import * as buffer from "@denops/std/buffer";
import * as variable from "@denops/std/variable";
import * as option from "@denops/std/option";

import { as, ensure, is } from "@core/unknownutil";
import {
  type Buffer,
  isBufferOpener,
  type Router,
} from "@kyoh86/denops-router";
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
