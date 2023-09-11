// Single Post Buffer

import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v5.0.1/autocmd/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

import { Handler } from "../router.ts";
import type { Context, Params } from "../router.ts";
import type { UpdatePostParams } from "../api/types.ts";
import { Client } from "../api/client.ts";
import { Filetype } from "./filetype.ts";

function ensureProps(props: unknown) {
  return ensure(
    props,
    is.ObjectOf({
      domain: is.String,
      postId: is.String,
    }),
  );
}

const pattern = new URLPattern({
  hostname: "teams",
  pathname: "/:domain(\\w+)/posts/:postId(\\d+)",
});

export const Post: Handler = {
  accept(bufname: string) {
    return pattern.exec(bufname);
  },

  bufname(_props: Record<string, undefined>) {
    const props = ensureProps(_props);
    return `docbase://teams/${props.domain}/posts/${props.postId}`;
  },

  async load(denops: Denops, context: Context) {
    await buffer.ensure(denops, context.bufnr, async () => {
      const props = ensureProps(context.match.pathname.groups);

      await batch(denops, async (denops) => {
        await option.swapfile.setLocal(denops, false);
        await option.bufhidden.setLocal(denops, "unload");
        await option.filetype.setLocal(denops, `${Filetype.Post}`);
        await option.buftype.setLocal(denops, "acwrite");

        await autocmd.group(
          denops,
          "docbase-writecmd",
          (helper) => {
            helper.remove("*", "<buffer>");
            helper.define(
              "BufWriteCmd",
              "<buffer>",
              `call denops#notify("${denops.name}", "bufferAction", [bufnr(), "save", {}])`,
            );
          },
        );
      });

      const state = await context.state.load(props.domain);
      if (!state) {
        console.error(
          `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
        );
        return;
      }
      const client = new Client(state.token, props.domain);
      const response = await client.posts().get(props.postId);
      if (!response.ok) {
        throw new Error(response.statusText, { cause: response });
      }
      // TODO: update buffer content with response.body;
    });
  },

  act: {
    async save(_denops: Denops, context: Context, _params: Params) {
      const props = ensureProps(context);
      const state = await context.state.load(props.domain);
      if (!state) {
        console.error(
          `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
        );
        return;
      }
      const client = new Client(state.token, props.domain);
      const post: UpdatePostParams = {
        title: "hoge",
        scope: "private",
      }; // TODO: get buffer content into post;
      const response = await client.posts().update(props.postId, post);
      if (!response.ok) {
        throw new Error(response.statusText, { cause: response });
      }
    },
  },
};
