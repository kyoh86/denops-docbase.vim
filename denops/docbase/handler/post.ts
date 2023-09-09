import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v5.0.1/autocmd/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

import { Filetype } from "../filetype.ts";
import { StateMan } from "../state.ts";
import { Handler } from "../router.ts";

import type { UpdatePostParams } from "../api/types.ts";
import { Client } from "../api/client.ts";

export class Post implements Handler {
  props: {
    domain: string;
    postId: string;
  };

  static new(
    stateMan: StateMan,
    groups: Record<string, string | undefined> | undefined,
  ) {
    return new Post(stateMan, groups);
  }

  constructor(
    private stateMan: StateMan,
    groups: Record<string, string | undefined> | undefined,
  ) {
    this.props = ensure(
      groups,
      is.ObjectOf({
        domain: is.String,
        postId: is.String,
      }),
    );
  }

  async load(denops: Denops, bufNr: number) {
    await buffer.ensure(denops, bufNr, async () => {
      await batch(denops, async (denops) => {
        await option.swapfile.setLocal(denops, false);
        await option.bufhidden.setLocal(denops, "unload");
        await option.filetype.setLocal(denops, `${Filetype.Post}.markdown`);
        await option.buftype.setLocal(denops, "acwrite");

        await autocmd.group(
          denops,
          "docbase-writecmd",
          (helper) => {
            helper.remove("*", "<buffer>");
            helper.define(
              "BufWriteCmd",
              "<buffer>",
              `call denops#notify("${denops.name}", "saveBuffer", [<abuf>, "<afile>"])`,
            );
          },
        );
        return Promise.resolve();
      });
    });

    const domain = this.props.domain;
    const state = await this.stateMan.loadState(domain);
    if (!state) {
      console.error(
        `There's no valid state for domain "${domain}". You can setup with :DocbaseLogin`,
      );
      return;
    }
    const client = new Client(state.token, domain);
    const response = await client.posts().get(this.props.postId);
    if (!response.ok) {
      throw new Error(response.statusText, { cause: response });
    }
    // TODO: update buffer content with response.body;
  }

  async save(denops: Denops, bufNr: number) {
    const domain = this.props.domain;
    const state = await this.stateMan.loadState(domain);
    if (!state) {
      console.error(
        `There's no valid state for domain "${domain}". You can setup with :DocbaseLogin`,
      );
      return;
    }
    const client = new Client(state.token, domain);
    const post: UpdatePostParams = {
      title: "hoge",
      scope: "private",
    }; // TODO: get buffer content into post;
    const response = await client.posts().update(this.props.postId, post);
    if (!response.ok) {
      throw new Error(response.statusText, { cause: response });
    }
  }
}
