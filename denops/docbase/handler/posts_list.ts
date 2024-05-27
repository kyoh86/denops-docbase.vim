// Post List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";
import { batch } from "https://deno.land/x/denops_std@v6.5.0/batch/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

import { isPost } from "../types.ts";
import { Filetype, prepareViewer, setViewerContent } from "./buffer.ts";
import { openBuffer } from "../router.ts";
import type { Context, Params } from "../router.ts";
import { Client } from "../api/client.ts";
import { Buffer } from "../../router/types.ts";
import { StateMan } from "../state.ts";
import { Router } from "../../router/router.ts";

export async function load(denops: Denops, buf: Buffer, stateMan: StateMan) {
  await buffer.ensure(denops, buf.bufnr, async () => {
    await prepareViewer(denops, Filetype.PostList);

    const props = ensure(
      buf.bufname.params,
      is.ObjectOf({
        domain: is.String,
        page: is.OptionalOf(is.Number),
      }),
    );
    const page = props.page || 1;

    const state = await stateMan.load(props.domain);
    if (!state) {
      getLogger("denops-docbase").error(
        `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
      );
      return;
    }
    const client = new Client(
      state.token,
      props.domain,
    );
    const response = await client.posts().search({ page, per_page: 100 });
    if (!response.ok) {
      getLogger("denops-docbase").error(
        `Failed to load posts from the DocBase API: ${
          response.error || response.statusText
        }`,
      );
      return;
    }
    const postIds = response.body.posts.map((p) => p.id);
    const postTitles = response.body.posts.map((p) => p.title);

    await batch(denops, async (denops) => {
      await variable.b.set(denops, "docbase_posts_list_page", page);
      await variable.b.set(denops, "docbase_posts_list_domain", props.domain);
      await variable.b.set(denops, "docbase_posts_list_ids", postIds);
    });
    await setViewerContent(denops, buf.bufnr, postTitles);
  });
}

export async function open(denops: Denops, router: Router, uParams: Params) {
  const params = ensure(
    uParams,
    is.ObjectOf({ lnum: is.Number, mods: is.OptionalOf(is.String) }),
  );
  const domain = ensure(
    await variable.b.get(denops, "docbase_posts_list_domain"),
    is.String,
  );
  const postIds = ensure(
    await variable.b.get(denops, "docbase_posts_list_items"),
    is.ArrayOf(isPost),
  );
  await router.open(denops, "post", params.mods, {
    domain,
    postId: String(postIds[params.lnum - 1]),
  });
}

async function paging(
  denops: Denops,
  router: Router,
  buf: Buffer,
  shift: 1 | -1,
) {
  const { page, domain } = await buffer.ensure(
    denops,
    buf.bufnr,
    async () => {
      return {
        domain: ensure(
          await variable.b.get(denops, "docbase_posts_list_domain"),
          is.String,
        ),
        page: ensure(
          await variable.b.get(denops, "docbase_posts_list_page", 1),
          is.Number,
        ),
      };
    },
  );
  if (page + shift >= 1) {
    await router.open(denops, "posts", "", {
      domain,
      page: (page + shift).toString(),
    });
  }
}

export function prev(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, -1);
}

export function next(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, 1);
}
