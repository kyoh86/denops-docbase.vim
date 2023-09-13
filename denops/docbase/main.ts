import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import {
  echo,
  input,
} from "https://deno.land/x/denops_std@v5.0.1/helper/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

import { isOpener, isSearchPostsParams } from "./types.ts";
import { Client } from "./api/client.ts";
import { bufferAction, bufferLoaded, openBuffer } from "./router.ts";
import { XDGStateMan } from "./state.ts";

export function main(denops: Denops) {
  const stateMan = new XDGStateMan();

  denops.dispatcher = {
    async openBuffer(uHandler: unknown, uProps: unknown, uOpener: unknown) {
      const handler = ensure(uHandler, is.String);
      const props = ensure(uProps, is.Record);
      const opener = ensure(uOpener, is.OptionalOf(isOpener));
      await openBuffer(denops, handler, props, opener);
    },

    async bufferLoaded(uBufnr: unknown) {
      const bufnr = ensure(uBufnr, is.Number);
      await bufferLoaded(denops, stateMan, bufnr);
    },

    async bufferAction(uBufnr: unknown, uActName: unknown, uParams: unknown) {
      const bufnr = ensure(uBufnr, is.Number);
      const params = ensure(uParams, is.Record);
      const actName = ensure(uActName, is.String);
      await bufferAction(denops, stateMan, bufnr, actName, params);
    },

    listDomains() {
      return stateMan.domains();
    },

    async searchPosts(uDomain: unknown, uSearchParams: unknown) {
      const domain = ensure(uDomain, is.String);
      const params = ensure(uSearchParams, is.OptionalOf(isSearchPostsParams));
      const state = await stateMan.load(domain);
      if (!state) {
        throw new Error(
          `There's no valid state for domain "${domain}". You can setup with :DocbaseLogin`,
        );
      }
      const client = new Client(
        state.token,
        domain,
      );
      const response = await client.posts().search(params || {});
      if (!response.ok) {
        throw new Error(
          `Failed to load posts from the DocBase API: ${response.statusText}`,
        );
      }
      return response.body.posts;
    },

    async login() {
      const domain = await input(denops, {
        prompt: "Domain: ",
      });
      if (!domain) {
        console.warn("Cancelled");
        return;
      }
      const token = await input(denops, {
        prompt: "Token: ",
        inputsave: true,
      });
      if (!token) {
        console.warn("Cancelled");
        return;
      }

      await stateMan.save(domain, { token });
      await echo(denops, "Done");
    },
  };
}
