import { test } from "https://deno.land/x/denops_test@v1.8.0/mod.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { Router } from "./router.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

test({
  mode: "all",
  name: "all",
  fn: async (denops) => {
    const r = new Router("foo");
    r.route("path/to", {
      load: (_loc) => Promise.resolve(),
    });
    denops.dispatcher = await r.dispatch(denops, {});
    assert(true, "setting handler and dispatching should be successed");

    r.route("assert-loaded", {
      load: (_loc) => Promise.resolve(),
    });

    await denops.call("denops#request", denops.name, "router:open", [
      "assert-loaded",
      "",
      { id: "123" },
    ]);
    const buffers = ensure(
      await denops.call("getbufinfo", "foo://assert-loaded;id=123"),
      is.ArrayOf(is.ObjectOf({ variables: is.Record })),
    );
    assert(buffers.length === 1, "buffer should be opened");
    const marker = buffers[0].variables.denops_router_handler_path;
    assert(
      marker === "assert-loaded",
      "handler marker should be set as loaded",
    );

    // TODO: router:internal:save
    // TODO: router:action
  },
});
