import { Denops } from "https://deno.land/x/denops_std@v6.4.0/mod.ts";
import {
  echo,
  input,
} from "https://deno.land/x/denops_std@v6.4.0/helper/mod.ts";
import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "https://deno.land/std@0.222.1/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.222.1/fs/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.3/mod.ts";
import {
  ConsoleHandler,
  getLogger,
  RotatingFileHandler,
  setup,
} from "https://deno.land/std@0.222.1/log/mod.ts";

import { isSearchPostsParams } from "./types.ts";
import { Client } from "./api/client.ts";
import { bufferAction, bufferLoaded, openBuffer } from "./router.ts";
import { XDGStateMan } from "./state.ts";

export async function main(denops: Denops) {
  const stateMan = new XDGStateMan();
  const cacheFile = join(xdg.cache(), "denops-docbase-vim", "log.txt");
  await ensureFile(cacheFile);

  setup({
    handlers: {
      console: new ConsoleHandler("DEBUG"),
      cache: new RotatingFileHandler("DEBUG", {
        filename: cacheFile,
        maxBytes: 1024 * 1024,
        maxBackupCount: 1,
      }),
    },
    loggers: {
      "denops-docbase": {
        level: "INFO",
        handlers: ["console", "cache"],
      },
      "denops-docbase-verbose": {
        level: "DEBUG",
        handlers: ["cache"],
      },
    },
  });

  denops.dispatcher = {
    async openBuffer(uHandler: unknown, uProps: unknown, uMods: unknown) {
      try {
        const handler = ensure(uHandler, is.String);
        const props = ensure(uProps, is.Record);
        const mods = ensure(uMods, is.OptionalOf(is.String));
        await openBuffer(denops, handler, props, mods);
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    async bufferLoaded(uBufnr: unknown) {
      try {
        const bufnr = ensure(uBufnr, is.Number);
        await bufferLoaded(denops, stateMan, bufnr);
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    async bufferAction(uBufnr: unknown, uActName: unknown, uParams: unknown) {
      try {
        const bufnr = ensure(uBufnr, is.Number);
        const params = ensure(uParams, is.Record);
        const actName = ensure(uActName, is.String);
        await bufferAction(denops, stateMan, bufnr, actName, params);
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    listDomains() {
      try {
        return stateMan.domains();
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    async searchPosts(uDomain: unknown, uSearchParams: unknown) {
      try {
        const domain = ensure(uDomain, is.String);
        const params = ensure(
          uSearchParams,
          is.OptionalOf(isSearchPostsParams),
        );
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
            `Failed to load posts from the DocBase API: ${
              response.error || response.statusText
            }`,
          );
        }
        return response.body;
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    async login() {
      try {
        const domain = await input(denops, {
          prompt: "Domain: ",
        });
        if (!domain) {
          getLogger("denops-docbase").warn("Cancelled");
          return;
        }
        const token = await input(denops, {
          prompt: "Token: ",
          inputsave: true,
        });
        if (!token) {
          getLogger("denops-docbase").warn("Cancelled");
          return;
        }

        await stateMan.save(domain, { token });
        await echo(denops, "Done");
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },
  };
}
