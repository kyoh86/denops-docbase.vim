// Post List View

import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v5.0.1/variable/variable.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";

import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

import { Filetype } from "../filetype.ts";
import { StateMan } from "../state.ts";
import { Handler } from "../router.ts";

import { Client } from "../api/client.ts";

export class PostList implements Handler {
  props: {
    domain: string;
  };

  static new(
    stateMan: StateMan,
    groups: Record<string, string | undefined> | undefined,
  ) {
    return new PostList(stateMan, groups);
  }

  constructor(
    private stateMan: StateMan,
    groups: Record<string, string | undefined> | undefined,
  ) {
    this.props = ensure(
      groups,
      is.ObjectOf({
        domain: is.String,
      }),
    );
  }

  async load(denops: Denops, bufNr: number) {
    await buffer.ensure(denops, bufNr, async () => {
      await batch(denops, async (denops) => {
        await option.swapfile.setLocal(denops, false);
        await option.modifiable.setLocal(denops, false);
        await option.bufhidden.setLocal(denops, "wipe");
        await option.filetype.setLocal(denops, Filetype.PostList);

        const domain = this.props.domain;
        const state = await this.stateMan.loadState(domain);
        if (!state) {
          console.error(
            `There's no valid state for domain "${domain}". You can setup with :DocbaseLogin`,
          );
          return;
        }
        const client = new Client(
          state.token,
          domain,
        );
        const response = await client.posts().search({});
        if (!response.ok) {
          console.error(
            `Failed to load posts from the DocBase API: ${response.statusText}`,
          );
          return;
        }

        await variable.b.set(denops, "denops_post_list_items", response.body);
        await buffer.replace(
          denops,
          bufNr,
          response.body.posts.map((post) => post.title),
        );

        await option.modified.setLocal(denops, false);
        await option.readonly.setLocal(denops, false);
        return Promise.resolve();
      });
    });
  }
}
