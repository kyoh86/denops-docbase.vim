// New Post Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.4.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v6.4.0/helper/execute.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.4.0/buffer/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.3/mod.ts";
import { getLogger } from "https://deno.land/std@0.222.1/log/mod.ts";

import { Handler, openBuffer } from "../router.ts";
import type { Context, Params } from "../router.ts";
import type { CreatePostParams } from "../types.ts";
import { Client } from "../api/client.ts";
import { Filetype, prepareProxy } from "./buffer.ts";
import { parsePostBuffer, saveGroupsIntoPostBuffer } from "./post.ts";

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
  pathname: "/:domain(\\w+)/posts/new",
});

export const NewPost: Handler = {
  accept(bufname: string) {
    return pattern.exec(bufname);
  },

  bufname(_props: Record<string, undefined>) {
    const props = ensureProps(_props);
    return `docbase://teams/${props.domain}/posts/new`;
  },

  async load(denops: Denops, context: Context) {
    const props = ensureProps(context.match.pathname.groups);

    await prepareProxy(denops, context.bufnr, Filetype.NewPost);

    const state = await context.state.load(props.domain);
    if (!state) {
      getLogger("denops-docbase").error(
        `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
      );
      return;
    }
    const client = new Client(state.token, props.domain);
    await saveGroupsIntoPostBuffer(denops, client, context.bufnr);
    const lines = initialContent();
    await buffer.replace(denops, context.bufnr, lines);
  },

  act: {
    async save(denops: Denops, context: Context, _params: Params) {
      const props = ensureProps(context.match.pathname.groups);
      const state = await context.state.load(props.domain);
      if (!state) {
        getLogger("denops-docbase").error(
          `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
        );
        return;
      }

      const post = await bufferToPost(denops, context.bufnr);
      const client = new Client(state.token, props.domain);
      const response = await client.posts().create(post);
      if (!response.ok) {
        getLogger("denops-docbase").error(
          `Failed to create new post with the DocBase API: ${
            response.error || response.statusText
          }`,
        );
        return;
      }
      await openBuffer(denops, "Post", {
        domain: props.domain,
        postId: `${response.body.id}`,
      });
      await execute(denops, `${context.bufnr}bdelete!`);
    },
  },
};

function initialContent() {
  return [
    "---",
    'title: ""',
    "draft: true",
    "scope: private",
    "tags: []",
    "groups: []",
    "---",
  ];
}

async function bufferToPost(denops: Denops, bufnr: number) {
  const post = await parsePostBuffer(denops, bufnr);
  let params: CreatePostParams = {
    title: post.attr.title,
    body: post.body,
    draft: post.attr.draft || false,
    notice: false,
    tags: post.attr.tags,
    scope: "private",
  };
  if (post.attr.scope == "group") {
    params = {
      ...params,
      scope: "group",
      groups: post.groups,
    };
  } else {
    params = {
      ...params,
      scope: post.attr.scope,
    };
  }
  return params;
}
