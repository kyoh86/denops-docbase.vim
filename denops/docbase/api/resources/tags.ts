import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.13.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const TagFields = {
  id: is.Number,
  name: is.String,
};
export interface Tag extends O<typeof TagFields> {
  _?: unknown;
}
export const isTag: P<Tag> = is.ObjectOf(TagFields);

const TagSummaryFields = {
  name: is.String,
};
export interface TagSummary extends O<typeof TagSummaryFields> {
  _?: unknown;
}
export const isTagSummary: P<TagSummary> = is.ObjectOf(TagSummaryFields);

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request("GET", "/tags", is.ArrayOf(isTag));
  }
}
