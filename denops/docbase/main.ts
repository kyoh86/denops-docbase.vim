import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import {
  echo,
  input,
} from "https://deno.land/x/denops_std@v5.0.1/helper/mod.ts";
import { getHandler } from "./router.ts";
import { XDGStateMan } from "./state.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

export function main(denops: Denops) {
  const stateMan = new XDGStateMan();
  denops.dispatcher = {
    async loadBuffer(uBufNr: unknown, uBufName: unknown) {
      const bufNr = ensure(uBufNr, is.Number);
      const bufName = ensure(uBufName, is.String);
      await buffer.ensure(denops, bufNr, async () => {
        const handler = getHandler(stateMan, bufName);
        await handler.load(denops, bufNr);
      });
    },

    async saveBuffer(uBufNr: unknown, uBufName: unknown) {
      const bufNr = ensure(uBufNr, is.Number);
      const bufName = ensure(uBufName, is.String);
      await buffer.ensure(denops, bufNr, async () => {
        const handler = getHandler(stateMan, bufName);
        if (handler.save) {
          await handler.save(denops, bufNr);
        }
      });
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

      await stateMan.saveState(domain, { token });
      await echo(denops, "Done");
    },
  };
}
