// Post List Buffer

import type { Denops } from "jsr:@denops/std@~7.4.0";
import * as buffer from "jsr:@denops/std@~7.4.0/buffer";
import * as variable from "jsr:@denops/std@~7.4.0/variable";
import * as option from "jsr:@denops/std@~7.4.0/option";
import { batch } from "jsr:@denops/std@~7.4.0/batch";
import { getLogger } from "jsr:@std/log@~0.224.5";
import { as, ensure, is } from "jsr:@core/unknownutil@~4.3.0";

import { Filetype } from "./filetype.ts";
import { Client } from "../api/client.ts";
import type { StateMan } from "../state.ts";
import {
  type Buffer,
  isBufferOpener,
  type Router,
} from "jsr:@kyoh86/denops-router@~0.3.0";

export async function loadPostsList(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(
    buf.bufname.params,
    is.ObjectOf({
      domain: is.String,
      page: as.Optional(is.String),
      q: as.Optional(is.String),
    }),
  );
  const page = +(params.page || 1);
  const q = params.q;

  await option.bufhidden.setBuffer(denops, buf.bufnr, "wipe");

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
  const response = await client.posts().search({
    page,
    per_page: 100,
    q,
  });
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
      if (q) {
        await variable.b.set(denops, "docbase_posts_list_q", q);
      }

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
    is.ObjectOf({ lnum: is.Number, open_option: as.Optional(isBufferOpener) }),
  );
  const domain = ensure(
    await variable.b.get(denops, "docbase_posts_list_domain"),
    is.String,
  );
  const postIds = ensure(
    await variable.b.get(denops, "docbase_posts_list_ids"),
    is.ArrayOf(is.Number),
  );
  await router.open(
    denops,
    "post",
    {
      domain,
      postId: String(postIds[params.lnum - 1]),
    },
    undefined,
    params.open_option,
  );
}

async function paging(
  denops: Denops,
  router: Router,
  buf: Buffer,
  shift: 1 | -1,
) {
  const { page, domain, q } = await buffer.ensure(
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
        q: ensure(
          await variable.b.get(denops, "docbase_posts_list_q"),
          as.Optional(is.String),
        ),
      };
    },
  );
  const nextPage = page + shift;
  if (nextPage == 1) {
    await router.open(denops, "posts-list", {
      domain,
      q,
    });
  } else if (nextPage > 1) {
    await router.open(denops, "posts-list", {
      domain,
      q,
      page: nextPage.toString(),
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
