import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureFile } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { exists, expandGlob } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse, stringify } from "https://deno.land/std@0.224.0/toml/mod.ts";
import { is, maybe } from "https://deno.land/x/unknownutil@v3.18.0/mod.ts";

export type Domain = string;

export type State = {
  token: string;
};

export interface StateMan {
  domains(): Promise<string[]>;
  load(domain: Domain): Promise<State | undefined>;
  save(domain: Domain, state: State): Promise<void>;
}

export class XDGStateMan implements StateMan {
  static statePath(...subs: string[]) {
    return join(xdg.state(), "denops-docbase", ...subs);
  }

  async domains(): Promise<string[]> {
    const root = XDGStateMan.statePath("teams");
    const opt = { root, caseInsensitive: true };
    const glob = expandGlob("*.toml", opt);
    const teams: string[] = [];
    for await (const team of glob) {
      teams.push(team.name.replace(/\.toml$/i, ""));
    }
    return teams;
  }

  async load(domain: Domain) {
    const path = XDGStateMan.statePath("teams", `${domain}.toml`);
    if (!await exists(path, { isFile: true, isReadable: true })) {
      return;
    }
    return maybe(
      parse(await Deno.readTextFile(path)),
      is.ObjectOf({ token: is.String }),
    );
  }

  async save(domain: Domain, state: State) {
    const path = XDGStateMan.statePath("teams", `${domain}.toml`);
    await ensureFile(path);
    return Deno.writeTextFile(path, stringify(state), { create: true });
  }
}
