// Single Post Buffer

import { extract } from "https://deno.land/std@0.201.0/front_matter/yaml.ts";
import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v5.0.1/variable/variable.ts";
import { getbufline } from "https://deno.land/x/denops_std@v5.0.1/function/buffer.ts";
import * as option from "https://deno.land/x/denops_std@v5.0.1/option/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v5.0.1/autocmd/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

import { Handler } from "../router.ts";
import type { Context, Params } from "../router.ts";
import type { Post as PostData, UpdatePostParams } from "../api/types.ts";
import { isGroupSummary } from "../api/validation.ts";
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
      const postResponse = await client.posts().get(props.postId);
      if (!postResponse.ok) {
        throw new Error(postResponse.statusText, { cause: postResponse });
      }
      const groupsResponse = await client.groups().search({ per_page: 1000 });
      if (!groupsResponse.ok) {
        throw new Error(groupsResponse.statusText, { cause: groupsResponse });
      }
      await batch(
        denops,
        async (denops) => {
          await variable.b.set(
            denops,
            "docbase_post_groups",
            groupsResponse.body,
          );
          await postToBuffer(denops, context.bufnr, postResponse.body);
        },
      );
    });
  },

  act: {
    async save(denops: Denops, context: Context, _params: Params) {
      const props = ensureProps(context);
      const state = await context.state.load(props.domain);
      if (!state) {
        console.error(
          `There's no valid state for domain "${props.domain}". You can setup with :DocbaseLogin`,
        );
        return;
      }

      const post = await bufferToPost(denops, context.bufnr);
      const client = new Client(state.token, props.domain);
      const response = await client.posts().update(props.postId, post);
      if (!response.ok) {
        throw new Error(response.statusText, { cause: response });
      }
    },
  },
};

async function bufferToPost(denops: Denops, bufnr: number) {
  const groups = await buffer.ensure(denops, bufnr, () => {
    return ensure(
      variable.b.get(
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
  const lines = await getbufline(denops, bufnr, 1);
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
  let post: UpdatePostParams = {
    title: attr.title,
    draft: attr.draft,
    tags: attr.tags,
    body: content.body,
  };
  if (attr.scope == "group") {
    post = {
      ...post,
      scope: "group",
      groups: attr.groups.map((name) => {
        const id = groups[name];
        if (id !== undefined) {
          return id;
        }
        throw new Error(`Invalid group: ${name}`);
      }).filter((g) => !!g),
    };
  } else {
    post = {
      ...post,
      scope: attr.scope,
    };
  }
  return post;
}

async function postToBuffer(denops: Denops, bufnr: number, post: PostData) {
  const lines = [
    "---",
    `title: ${post.title}`,
    `scope: ${post.scope || "private"}`,
  ];
  if (post.draft) {
    lines.push("draft: true");
  }
  if (post.tags.length > 0) {
    lines.push("tags:");
    post.tags.forEach((g) => {
      lines.push(`  - ${g.name}`);
    });
  }
  if (post.groups.length > 0) {
    lines.push("groups:");
    post.groups.forEach((t) => {
      lines.push(`  - ${t.name}`);
    });
  }
  lines.push("---");
  await buffer.replace(denops, bufnr, lines.concat(post.body.split(/\r?\n/)));
}
