import type { Denops } from "jsr:@denops/std@~7.4.0";
import { echo, input } from "jsr:@denops/std@~7.4.0/helper";
import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "jsr:@std/path@~1.0.2";
import { ensureFile } from "jsr:@std/fs@~1.0.0";
import { ensure, is } from "jsr:@core/unknownutil@~4.3.0";
import {
  ConsoleHandler,
  getLogger,
  RotatingFileHandler,
  setup,
} from "jsr:@std/log@~0.224.5";

import { isSearchPostsParams } from "./types.ts";
import { Client } from "./api/client.ts";
import { Router } from "jsr:@kyoh86/denops-router@~0.3.0-alpha.5";
import { XDGStateMan } from "./state.ts";

import { loadTeamsList, openPostsList } from "./handler/teams_list.ts";
import { loadPost, savePost } from "./handler/post.ts";
import { loadNewPost, saveNewPost } from "./handler/new_post.ts";
import {
  loadPostsList,
  nextPostsList,
  openPost,
  prevPostsList,
} from "./handler/posts_list.ts";
import {
  loadGroupsList,
  nextGroupsList,
  openGroup,
  prevGroupsList,
} from "./handler/groups_list.ts";

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
  router.handle("teams-list", {
    load: (buf) => loadTeamsList(denops, stateMan, buf),
    actions: {
      open: (_, params) => openPostsList(denops, router, params),
    },
  });

  router.handle("posts-list", {
    load: (buf) => loadPostsList(denops, stateMan, buf),
    actions: {
      open: (_, params) => openPost(denops, router, params),
      next: (buf, _) => nextPostsList(denops, router, buf),
      prev: (buf, _) => prevPostsList(denops, router, buf),
    },
  });

  router.handle("groups-list", {
    load: (buf) => loadGroupsList(denops, stateMan, buf),
    actions: {
      open: (_, params) => openGroup(denops, router, params),
      next: (buf, _) => nextGroupsList(denops, router, buf),
      prev: (buf, _) => prevGroupsList(denops, router, buf),
    },
  });

  router.handle("post", {
    load: (buf) => loadPost(denops, stateMan, buf),
    save: (buf) => savePost(denops, stateMan, buf),
  });

  router.handle("new-post", {
    load: (buf) => loadNewPost(denops, stateMan, buf),
    save: (buf) => saveNewPost(denops, stateMan, router, buf),
  });

  denops.dispatcher = await router.dispatch(denops, {
    listDomains() {
      try {
        return stateMan.domains();
      } catch (err) {
        getLogger("denops-docbase").error(err);
      }
    },

    async searchPosts(uSearchParams: unknown) {
      try {
        const params = ensure(
          uSearchParams,
          is.IntersectionOf([
            is.ObjectOf({ domain: is.String }),
            isSearchPostsParams,
          ]),
        );
        const state = await stateMan.load(params.domain);
        if (!state) {
          throw new Error(
            `There's no valid state for domain "${params.domain}". You can setup with :DocbaseLogin`,
          );
        }
        const client = new Client(
          state.token,
          params.domain,
        );
        const response = await client.posts().search(params);
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
