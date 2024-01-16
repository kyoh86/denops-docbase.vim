import {
  is,
  // ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";

export type Opener = "edit" | "new" | "vnew" | "tabnew";
export const isOpener: P<Opener> = is.OneOf([
  is.LiteralOf("edit"),
  is.LiteralOf("new"),
  is.LiteralOf("vnew"),
  is.LiteralOf("tabnew"),
]);

export * from "./api/types.ts";
export * from "./api/validation.ts";
