// Single Post Buffer

import { extract } from "https://deno.land/std@0.224.0/front_matter/yaml.ts";
import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";
import { getbufline } from "https://deno.land/x/denops_std@v6.5.0/function/buffer.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";

import { Filetype, prepareProxy } from "./buffer.ts";
import { Handler } from "../router.ts";
import type { Context, Params } from "../router.ts";
import type { Post as PostData, UpdatePostParams } from "../types.ts";
import { isGroupSummary } from "../types.ts";
import { Client } from "../api/client.ts";

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

  bufname(rProps: Record<string, undefined>) {
    const props = ensureProps(rProps);
    return `docbase://teams/${props.domain}/posts/${props.postId}`;
  },

  async load(denops: Denops, context: Context) {
    const props = ensureProps(context.match.pathname.groups);

    await prepareProxy(denops, context.bufnr, Filetype.Post);

    const state = await context.state.load(props.domain);
    if (!state) {
      getLogger("denops-docbase").error(
        `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
      );
      return;
    }
    const client = new Client(state.token, props.domain);
    await saveGroupsIntoPostBuffer(denops, client, context.bufnr);

    const response = await client.posts().get(props.postId);
    if (!response.ok) {
      getLogger("denops-docbase").error(
        `Failed to load a post from the DocBase API: ${
          response.error || response.statusText
        }`,
      );
      return;
    }

    const lines = postToBuffer(response.body);
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
      const response = await client.posts().update(props.postId, post);
      if (!response.ok) {
        getLogger("denops-docbase").error(
          `Failed to update the post with the DocBase API: ${
            response.error || response.statusText
          }`,
        );
        return;
      }
      await buffer.ensure(denops, context.bufnr, async () => {
        await option.modified.setLocal(denops, false);
      });
    },
  },
};

async function bufferToPost(denops: Denops, bufnr: number) {
  const post = await parsePostBuffer(denops, bufnr);
  let params: UpdatePostParams = {
    title: post.attr.title,
    draft: post.attr.draft,
    tags: post.attr.tags,
    body: post.body,
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

function postToBuffer(post: PostData) {
  const lines = [
    "---",
    `title: "${post.title}"`,
    `scope: ${post.scope || "private"}`,
  ];
  if (post.draft) {
    lines.push("draft: true");
  }
  if (post.tags.length > 0) {
    lines.push("tags:");
    post.tags.forEach((g) => {
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
  return lines.concat(post.body.split(/\r?\n/));
}

export async function parsePostBuffer(denops: Denops, bufnr: number) {
  const lines = await getbufline(denops, bufnr, 1, "$");
  const attrFields = {
    title: is.String,
    draft: is.OptionalOf(is.Boolean),
    tags: is.OptionalOf(is.ArrayOf(is.String)),
  };
  const content = extract(lines.join("\n"));
  const attr = ensure(
    content.attrs,
    is.OneOf([
      is.ObjectOf({
        ...attrFields,
        scope: is.LiteralOf("group"),
        groups: is.ArrayOf(is.String),
      }),
      is.ObjectOf({
        ...attrFields,
        scope: is.OneOf([
          is.LiteralOf("everyone"),
          is.LiteralOf("private"),
        ]),
      }),
    ]),
  );
  const allGroups = await buffer.ensure(denops, bufnr, async () => {
    return ensure(
      await variable.b.get(
        denops,
        "docbase_post_groups",
      ),
      is.ArrayOf(isGroupSummary),
    ).reduce<Record<string, number | undefined>>(
      (map, obj) => {
        map[obj.name] = obj.id;
        return map;
      },
      {},
    );
  });
  const groups = (attr.scope == "group")
    ? attr.groups.map((name) => {
      const id = allGroups[name];
      if (id !== undefined) {
        return id;
      }
      throw new Error(`Invalid group: ${name}`);
    }).filter((g) => !!g)
    : [];

  return {
    attr,
    groups,
    body: content.body,
  };
}

export async function saveGroupsIntoPostBuffer(
  denops: Denops,
  client: Client,
  bufnr: number,
) {
  const response = await client.groups().search({ per_page: 200 });
  if (!response.ok) {
    getLogger("denops-docbase").error(
      `Failed to load groups from the DocBase API: ${
        response.error || response.statusText
      }`,
    );
    return;
  }
  await buffer.ensure(denops, bufnr, async () => {
    await variable.b.set(
      denops,
      "docbase_post_groups",
      response.body,
    );
  });
}
