// Post List Buffer

import type { Denops } from "https://deno.land/x/denops_std@v5.2.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.2.0/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v5.2.0/variable/variable.ts";
import { batch } from "https://deno.land/x/denops_std@v5.2.0/batch/mod.ts";
import { getLogger } from "https://deno.land/std@0.212.0/log/mod.ts";
import {
  ensure,
  is,
  maybe,
} from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";

import { isOpener, isPost } from "../types.ts";
import { Filetype, prepareViewer, setViewerContent } from "./buffer.ts";
import { Handler, openBuffer } from "../router.ts";
import type { Context, Params } from "../router.ts";
import { Client } from "../api/client.ts";

function ensureProps(props: unknown) {
  return ensure(
    props,
    is.ObjectOf({
      domain: is.String,
    }),
  );
}
const pattern = new URLPattern({
  hostname: "teams",
  pathname: "/:domain(\\w+)/posts",
});

export const PostList: Handler = {
  accept(bufname: string) {
    return pattern.exec(bufname);
  },
  bufname(_props: Record<string, unknown>) {
    const props = ensureProps(_props);
    const page = maybe(_props["page"], is.Number);
    return `docbase://teams/${props.domain}/posts${
      (page && (page > 1)) ? `?page=${page}` : ""
    }`;
  },

  async load(denops: Denops, context: Context) {
    await buffer.ensure(denops, context.bufnr, async () => {
      await prepareViewer(denops, Filetype.PostList);

      const props = ensureProps(context.match.pathname.groups);
      const query = new URLSearchParams(context.match.search.input);
      const page = parseInt(query.get("page") || "1", 10);

      const state = await context.state.load(props.domain);
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
      await setViewerContent(denops, context.bufnr, postTitles);
    });
  },

  act: {
    async open(denops: Denops, _context: Context, _params: Params) {
      const params = ensure(
        _params,
        is.ObjectOf({ lnum: is.Number, opener: is.OptionalOf(isOpener) }),
      );
      const domain = ensure(
        await variable.b.get(denops, "docbase_posts_list_domain"),
        is.String,
      );
      const postIds = ensure(
        await variable.b.get(
          denops,
          "docbase_posts_list_items",
        ),
        is.ArrayOf(isPost),
      );
      await openBuffer(denops, "Post", {
        domain,
        postId: String(postIds[params.lnum - 1]),
      }, params.opener);
    },
    prev(denops: Denops, context: Context, _params: Params) {
      return paging(denops, context, -1);
    },
    next(denops: Denops, context: Context, _params: Params) {
      return paging(denops, context, 1);
    },
  },
};

async function paging(denops: Denops, context: Context, shift: 1 | -1) {
  const { page, domain } = await buffer.ensure(
    denops,
    context.bufnr,
    async () => {
      return {
        page: ensure(
          await variable.b.get(denops, "docbase_posts_list_page", 1),
          is.Number,
        ),
        domain: ensure(
          await variable.b.get(denops, "docbase_posts_list_domain"),
          is.String,
        ),
      };
    },
  );
  if (page + shift >= 1) {
    await openBuffer(denops, "PostList", { domain, page: page + shift });
  }
}
