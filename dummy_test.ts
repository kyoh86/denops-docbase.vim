import { test } from "jsr:@denops/test@2.0.1";
import { assert } from "jsr:@std/assert";

test({
  mode: "all",
  name: "dummy",
  fn: () => {
    assert(true);
  },
});
