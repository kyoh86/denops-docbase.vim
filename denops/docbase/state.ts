import xdg from "xdg";
import { join } from "@std/path";
import { ensureFile } from "@std/fs";
import { exists, expandGlob } from "@std/fs";
import { parse, stringify } from "@std/toml";
import { is, maybe } from "@core/unknownutil";

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
