// Group List Buffer

import type { Denops } from "jsr:@denops/std@~7.4.0";
import * as buffer from "jsr:@denops/std@~7.4.0/buffer";
import * as fn from "jsr:@denops/std@~7.4.0/function";
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

export async function loadGroupsList(
  denops: Denops,
  stateMan: StateMan,
  buf: Buffer,
) {
  const params = ensure(
    buf.bufname.params,
    is.ObjectOf({
      domain: is.String,
      page: as.Optional(is.String),
    }),
  );
  const page = +(params.page || 1);

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
  const response = await client.groups().search({
    page,
    per_page: 100,
  });
  if (!response.ok) {
    getLogger("denops-docbase").error(
      `Failed to load groups from the DocBase API: ${
        response.error || response.statusText
      }`,
    );
    return;
  }
  const groupNames = response.body.map((p) => p.name);

  await buffer.ensure(denops, buf.bufnr, async () => {
    await batch(denops, async (denops) => {
      await variable.b.set(denops, "docbase_groups_list_page", page);
      await variable.b.set(denops, "docbase_groups_list_domain", params.domain);

      await buffer.replace(denops, buf.bufnr, groupNames);

      await option.filetype.setLocal(denops, Filetype.GroupsList);
      await option.modified.setLocal(denops, false);
      await option.readonly.setLocal(denops, true);
    });
  });
}

export async function openGroup(
  denops: Denops,
  router: Router,
  uParams: Record<string, unknown>,
) {
  const params = ensure(
    uParams,
    is.ObjectOf({ lnum: is.Number, open_option: as.Optional(isBufferOpener) }),
  );
  const domain = ensure(
    await variable.b.get(denops, "docbase_groups_list_domain"),
    is.String,
  );
  await router.open(
    denops,
    "posts-list",
    {
      domain,
      q: await fn.getline(denops, params.lnum),
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
  const { page, domain } = await buffer.ensure(
    denops,
    buf.bufnr,
    async () => {
      return {
        domain: ensure(
          await variable.b.get(denops, "docbase_groups_list_domain"),
          is.String,
        ),
        page: ensure(
          await variable.b.get(denops, "docbase_groups_list_page", 1),
          is.Number,
        ),
      };
    },
  );
  if (page + shift >= 1) {
    await router.open(denops, "groups-list", {
      domain,
      page: (page + shift).toString(),
    });
  }
}

export function prevGroupsList(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, -1);
}

export function nextGroupsList(
  denops: Denops,
  router: Router,
  buf: Buffer,
) {
  return paging(denops, router, buf, 1);
}
