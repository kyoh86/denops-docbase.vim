import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "https://deno.land/std@0.201.0/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { exists, expandGlob } from "https://deno.land/std@0.201.0/fs/mod.ts";
import { parse, stringify } from "https://deno.land/std@0.201.0/toml/mod.ts";
import { is, maybe } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

type Domain = string;

type State = {
  token: string;
};

function statePath(...subs: string[]) {
  return join(xdg.state(), "nvim", "denops-docbase", ...subs);
}

export interface StateMan {
  getDomains(): Promise<string[]>;
  loadState(domain: Domain): Promise<State | undefined>;

  saveState(domain: Domain, state: State): Promise<void>;
}

export class XDGStateMan implements StateMan {
  async getDomains(): Promise<string[]> {
    const root = statePath("teams");
    const opt = { root, caseInsensitive: true };
    const glob = expandGlob("*.toml", opt);
    const teams: string[] = [];
    for await (const team of glob) {
      teams.push(team.name.replace(/\.toml$/i, ""));
    }
    return teams;
  }

  async loadState(domain: Domain) {
    const path = statePath("teams", `${domain}.toml`);
    if (!await exists(path, { isFile: true, isReadable: true })) {
      return;
    }
    return maybe(
      parse(await Deno.readTextFile(path)),
      is.ObjectOf({ token: is.String }),
    );
  }

  async saveState(domain: Domain, state: State) {
    const path = statePath("teams", `${domain}.toml`);
    await ensureFile(path);
    return Deno.writeTextFile(path, stringify(state), { create: true });
  }
}
