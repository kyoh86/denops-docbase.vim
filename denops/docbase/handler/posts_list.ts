// Post List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v6.5.0/batch/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

import { Filetype } from "./filetype.ts";
import { Client } from "../api/client.ts";
import { StateMan } from "../state.ts";
import type { Buffer } from "https://denopkg.com/kyoh86/denops-router@master/types.ts";
import type { Router } from "https://denopkg.com/kyoh86/denops-router@master/mod.ts";

export async function loadPostsList(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(
    buf.bufname.params,
    is.ObjectOf({
      domain: is.String,
      page: is.OptionalOf(is.Number),
    }),
  );
  const page = params.page || 1;

  const state = await stateMan.load(params.domain);
  if (!state) {
    getLogger("denops-docbase").error(
      `There's no valid state for domain "${params.domain}". You can setup with :DocbaseLogin`,
    );
    return;
  }
  const client = new Client(
    state.token,
    params.domain,
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

  await buffer.ensure(denops, buf.bufnr, async () => {
    await batch(denops, async (denops) => {
      await variable.b.set(denops, "docbase_posts_list_page", page);
      await variable.b.set(denops, "docbase_posts_list_domain", params.domain);
      await variable.b.set(denops, "docbase_posts_list_ids", postIds);

      await buffer.replace(denops, buf.bufnr, postTitles);

      await option.filetype.setLocal(denops, Filetype.PostsList);
      await option.modified.setLocal(denops, false);
      await option.readonly.setLocal(denops, true);
    });
  });
}

export async function openPost(
  denops: Denops,
  router: Router,
  uParams: Record<string, unknown>,
) {
  const params = ensure(
    uParams,
    is.ObjectOf({ lnum: is.Number, mods: is.OptionalOf(is.String) }),
  );
  const domain = ensure(
    await variable.b.get(denops, "docbase_posts_list_domain"),
    is.String,
  );
  const postIds = ensure(
    await variable.b.get(denops, "docbase_posts_list_ids"),
    is.ArrayOf(is.Number),
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
    await router.open(denops, "posts-list", "", {
      domain,
      page: (page + shift).toString(),
    });
  }
}

export function prevPostsList(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, -1);
}

export function nextPostsList(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, 1);
}
