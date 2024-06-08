// New Post Buffer

import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v6.5.0/helper/execute.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";

import type { CreatePostParams } from "../types.ts";
import { Client } from "../api/client.ts";
import { Filetype } from "./filetype.ts";
import { parsePostBuffer, saveGroupsIntoPostBuffer } from "./post.ts";
import type {
  Buffer,
  Router,
} from "https://denopkg.com/kyoh86/denops-router@v0.0.1-alpha.2/mod.ts";
import type { StateMan } from "../state.ts";

const isNewPostParams = is.ObjectOf({
  domain: is.String,
});

export async function loadNewPost(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(buf.bufname.params, isNewPostParams);

  buffer.ensure(denops, buf.bufnr, async () => {
    await option.filetype.setLocal(denops, Filetype.NewPost);
  });

  const state = await stateMan.load(params.domain);
  if (!state) {
    getLogger("denops-docbase").error(
      `There's no valid state for domain "${params.domain}". You can setup with :DocbaseLogin`,
    );
    return;
  }
  const client = new Client(state.token, params.domain);
  await saveGroupsIntoPostBuffer(denops, client, buf.bufnr);
  const lines = initialContent();
  await buffer.replace(denops, buf.bufnr, lines);
}

export async function saveNewPost(
  denops: Denops,
  stateMan: StateMan,
  router: Router,
  buf: Buffer,
) {
  const params = ensure(buf.bufname.params, isNewPostParams);
  const state = await stateMan.load(params.domain);
  if (!state) {
    getLogger("denops-docbase").error(
      `There's no valid state for domain "${params.domain}". You can setup with :DocbaseLogin`,
    );
    return;
  }

  const post = await bufferToPost(denops, buf.bufnr);
  const client = new Client(state.token, params.domain);
  const response = await client.posts().create(post);
  if (!response.ok) {
    getLogger("denops-docbase").error(
      `Failed to create new post with the DocBase API: ${
        response.error || response.statusText
      }`,
    );
    return;
  }
  await router.open(denops, "post", "", {
    domain: params.domain,
    postId: `${response.body.id}`,
  });
  await execute(denops, `${buf.bufnr}bdelete!`);
}

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
