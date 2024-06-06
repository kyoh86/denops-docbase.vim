import { Denops } from "https://deno.land/x/denops_std@v6.5.0/mod.ts";
import {
  echo,
  input,
} from "https://deno.land/x/denops_std@v6.5.0/helper/mod.ts";
import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import {
  ConsoleHandler,
  getLogger,
  RotatingFileHandler,
  setup,
} from "https://deno.land/std@0.224.0/log/mod.ts";

import { isSearchPostsParams } from "./types.ts";
import { Client } from "./api/client.ts";
import { Router } from "https://denopkg.com/kyoh86/denops-router/mod.ts";
import { XDGStateMan } from "./state.ts";

import { loadTeamsList, openPostsList } from "./handler/teams_list.ts";
import { loadNewPost, saveNewPost } from "./handler/new_post.ts";
import {
  loadPostsList,
  nextPostsList,
  openPost,
  prevPostsList,
} from "./handler/posts_list.ts";

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

  const router = new Router("docbase");
  router.handle("teams", {
    load: (buf) => loadTeamsList(denops, stateMan, buf),
    actions: {
      open: (_, params) => openPostsList(denops, router, params),
    },
  });

  router.handle("posts", {
    load: (buf) => loadPostsList(denops, stateMan, buf),
    actions: {
      open: (_, params) => openPost(denops, router, params),
      next: (buf, _) => nextPostsList(denops, router, buf),
      prev: (buf, _) => prevPostsList(denops, router, buf),
    },
  });

  router.handle("new-post", {
    load: (buf) => loadNewPost(denops, stateMan, buf),
    actions: {
      save: (buf, _) => saveNewPost(denops, stateMan, router, buf),
    },
  });

  denops.dispatcher = await router.dispatch(denops, {
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
  });
}
