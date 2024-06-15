// Single Post Buffer

import { extract } from "https://deno.land/std@0.224.0/front_matter/yaml.ts";
import type { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v6.5.0/buffer/mod.ts";
import * as option from "https://deno.land/x/denops_std@v6.5.0/option/mod.ts";
import * as variable from "https://deno.land/x/denops_std@v6.5.0/variable/variable.ts";
import { getbufline } from "https://deno.land/x/denops_std@v6.5.0/function/buffer.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { getLogger } from "https://deno.land/std@0.224.0/log/mod.ts";

import { Filetype } from "./filetype.ts";
import type { Post as PostData, UpdatePostParams } from "../types.ts";
import { isGroupSummary } from "../types.ts";
import { Client } from "../api/client.ts";
import type { Buffer } from "https://denopkg.com/kyoh86/denops-router@v0.0.1-alpha.2/mod.ts";
import type { StateMan } from "../state.ts";
import { getCacheFile } from "../cache.ts";

const isPostParams = is.ObjectOf({
  domain: is.String,
  postId: is.String,
});

async function fetchPost(client: Client, domain: string, postId: string) {
  const response = await client.posts().get(postId);
  if (!response.ok) {
    throw new Error(
      `Failed to load a post from the DocBase API: ${
        response.error || response.statusText
      }`,
    );
  }

  const lines = postToLines(response.body);
  await saveCache(domain, postId, lines);
  return lines;
}

export async function loadPost(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(buf.bufname.params, isPostParams);

  buffer.ensure(denops, buf.bufnr, async () => {
    await option.filetype.setLocal(denops, Filetype.Post);
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

  const lines = await fetchPost(client, params.domain, params.postId);
  await buffer.replace(denops, buf.bufnr, lines);
}

export async function savePost(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  try {
    await savePostCore(denops, stateMan, buf);
    await buffer.ensure(denops, buf.bufnr, async () => {
      await option.modified.setLocal(denops, false);
    });
  } catch (e) {
    if (e instanceof Error) {
      getLogger("denops-docbase").error(`[${e.name}] ${e.message}`);
      getLogger("denops-docbase-verbose").error(e);
    } else {
      throw e;
    }
  }
}

async function savePostCore(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(buf.bufname.params, isPostParams);
  const state = await stateMan.load(params.domain);
  if (!state) {
    throw new Error(
      `There's no valid state for domain "${params.domain}". You can setup with :DocbaseLogin`,
    );
  }
  const client = new Client(state.token, params.domain);

  const cacheFile = await getCacheFile(params.domain, params.postId);
  const patch = await getPatch(
    cacheFile,
    await getbufline(denops, buf.bufnr, 1, "$"),
  );
  const lines = await fetchPost(client, params.domain, params.postId); // update cache
  if (!patch) {
    await buffer.replace(denops, buf.bufnr, lines);
    return;
  }
  const [conflicted, merged] = await applyPatch(cacheFile, patch);
  await buffer.replace(denops, buf.bufnr, merged);
  if (conflicted) {
    throw new Error("Failed to save the post due to conflict");
  }
  const post = await bufferLinesToPost(denops, buf.bufnr, merged);
  const response = await client.posts().update(params.postId, post);
  if (!response.ok) {
    throw new Error(
      `Failed to update the post with the DocBase API: ${
        response.error || response.statusText
      }`,
    );
  }
  await saveCache(params.domain, params.postId, merged);
}

async function applyPatch(
  cacheFile: string,
  patch: string,
): Promise<[boolean, string[]]> {
  const proc = new Deno.Command("patch", {
    args: [cacheFile, "-", "--merge", "--output", "-"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  const writer = proc.stdin.getWriter();
  await writer.write(
    new TextEncoder().encode(patch),
  );
  writer.releaseLock();
  await proc.stdin.close();
  const merged = await proc.output();
  switch (merged.code) {
    case 0: { // merged without conflict
      return [false, new TextDecoder().decode(merged.stdout).split(/\r?\n/)];
    }
    case 1: { // conflicted
      return [true, new TextDecoder().decode(merged.stdout).split(/\r?\n/)];
    }
    default: { // troubled
      throw new Error(
        `Failed to run patch: ${new TextDecoder().decode(merged.stderr)}`,
      );
    }
  }
}

/**
 * Calling `diff` command to get diff of the current lines and the cache
 */
async function getPatch(cacheFile: string, lines: string[]) {
  const proc = new Deno.Command("diff", {
    args: ["-u", cacheFile, "-"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  const writer = proc.stdin.getWriter();
  await writer.write(
    new TextEncoder().encode(lines.join("\n")),
  );
  writer.releaseLock();
  await proc.stdin.close();
  const diff = await proc.output();
  switch (diff.code) {
    case 0: // no diff
      return undefined;
    case 1: // diff
      return new TextDecoder().decode(diff.stdout);
    default: // troubled
      throw new Error(
        `Failed to run diff: ${new TextDecoder().decode(diff.stderr)}`,
      );
  }
}

async function bufferLinesToPost(
  denops: Denops,
  bufnr: number,
  lines: string[],
): Promise<UpdatePostParams> {
  const post = await parsePostBufferLines(denops, bufnr, lines);
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

function postToLines(post: PostData) {
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

export async function parsePostBufferLines(
  denops: Denops,
  bufnr: number,
  lines: string[],
) {
  const attrFields = {
    title: is.String,
    draft: is.OptionalOf(is.Boolean),
    tags: is.OptionalOf(is.ArrayOf(is.String)),
  };
  const content = extract(lines.join("\n"));
  const attr = ensure(
    content.attrs,
    is.UnionOf([
      is.ObjectOf({
        ...attrFields,
        scope: is.LiteralOf("group"),
        groups: is.ArrayOf(is.String),
      }),
      is.ObjectOf({
        ...attrFields,
        scope: is.UnionOf([
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

async function saveCache(domain: string, postId: string, lines: string[]) {
  const encoder = new TextEncoder();
  const data = encoder.encode(lines.join("\n"));
  await Deno.writeFile(await getCacheFile(domain, postId), data);
}
