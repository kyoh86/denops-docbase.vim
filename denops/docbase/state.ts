import xdg from "https://deno.land/x/xdg@v10.6.0/src/mod.deno.ts";
import { join } from "jsr:@std/path@1.0.2";
import { ensureFile } from "jsr:@std/fs@1.0.0";
import { exists, expandGlob } from "jsr:@std/fs@1.0.0";
import { parse, stringify } from "jsr:@std/toml@1.0.0";
import { is, maybe } from "jsr:@core/unknownutil@3.18.1";

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
