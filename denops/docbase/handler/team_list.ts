// Team List View

import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";

import { Filetype } from "../filetype.ts";
import { StateMan } from "../state.ts";
import { Handler } from "../router.ts";

export class TeamList implements Handler {
  static new(
    stateMan: StateMan,
    _: Record<string, string | undefined> | undefined,
  ) {
    return new TeamList(stateMan);
  }
  constructor(
    private stateMan: StateMan,
  ) {}

  async load(denops: Denops, bufNr: number) {
    await buffer.ensure(denops, bufNr, async () => {
      await batch(denops, async (denops) => {
        await option.swapfile.setLocal(denops, false);
        await option.modifiable.setLocal(denops, false);
        await option.bufhidden.setLocal(denops, "wipe");
        await option.filetype.setLocal(denops, Filetype.TeamList);

        await buffer.replace(denops, bufNr, await this.stateMan.getDomains());

        await option.modified.setLocal(denops, false);
        await option.readonly.setLocal(denops, false);
        return Promise.resolve();
      });
    });
  }
}
