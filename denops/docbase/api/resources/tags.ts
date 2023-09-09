import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const TagFields = {
  id: is.Number,
  name: is.String,
};

export const TagPredicate = is.ObjectOf(TagFields);

export type Tag = ObjectOf<typeof TagFields>;

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request<Tag>("GET", "/tags");
  }
}
