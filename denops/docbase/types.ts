import {
  is,
  // ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

export type Opener = "edit" | "new" | "vnew" | "tabnew";
export const isOpener: P<Opener> = is.OneOf([
  is.LiteralOf("edit"),
  is.LiteralOf("new"),
  is.LiteralOf("vnew"),
  is.LiteralOf("tabnew"),
]);
