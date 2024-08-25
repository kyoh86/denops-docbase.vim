// New Post Buffer

import type { Denops } from "jsr:@denops/std@~7.0.1";
import { execute } from "jsr:@denops/std@~7.0.1/helper";
import * as option from "jsr:@denops/std@~7.0.1/option";
import * as buffer from "jsr:@denops/std@~7.0.1/buffer";
import { as, ensure, is } from "jsr:@core/unknownutil@~4.3.0";
import { getLogger } from "jsr:@std/log@~0.224.5";

import type { Post } from "../types.ts";
import type { CreatePostParams } from "../types.ts";
import { Client } from "../api/client.ts";
import { Filetype } from "./filetype.ts";
import { parsePostBufferLines, saveGroupsIntoPostBuffer } from "./post.ts";
import type { Buffer, Router } from "jsr:@kyoh86/denops-router@~0.3.0-alpha.2";
import type { StateMan } from "../state.ts";
import { getbufline } from "jsr:@denops/std@~7.0.1/function";

const isNewPostParams = is.ObjectOf({
  domain: is.String,
  template: as.Optional(is.String),
});

async function fetchTemplate(client: Client, postId: string) {
  const response = await client.posts().get(postId);
  if (!response.ok) {
    throw new Error(
      `Failed to load a post from the DocBase API: ${
        response.error || response.statusText
      }`,
    );
  }
  const lines = await templateToLines(client, response.body);
  return lines;
}

async function templateToLines(client: Client, post: Post) {
  const lines = [
    "---",
    `title: "${await client.templates().apply(post.title)}"`,
    `scope: ${post.scope || "private"}`,
  ];
  if (post.draft) {
    lines.push("draft: true");
  }
  const tags = post.tags.filter((t) => t.name != "template");
  if (tags.length > 0) {
    lines.push("tags:");
    tags.forEach((g) => {
      lines.push(`  - "${g.name}"`);
    });
  }
  if (post.groups.length > 0) {
    lines.push("groups:");
    post.groups.forEach((t) => {
      lines.push(`  - "${t.name}"`);
    });
  }
  lines.push("---");
  return lines.concat(
    (await client.templates().apply(post.body)).split(/\r?\n/),
  );
}

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
  const lines = params.template
    ? await fetchTemplate(client, params.template)
    : initialContent();
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
  await router.open(denops, "post", {
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
  const lines = await getbufline(denops, bufnr, 1, "$");
  const post = await parsePostBufferLines(denops, bufnr, lines);
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
