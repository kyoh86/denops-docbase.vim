import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const TagFields = {
  id: is.Number,
  name: is.String,
};
export interface Tag extends O<typeof TagFields> {
  _?: unknown;
}
export const isTag: P<Tag> = is.ObjectOf(TagFields);

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request("GET", "/tags", is.ArrayOf(isTag));
  }
}
