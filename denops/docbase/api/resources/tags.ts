import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { Fetcher } from "../fetcher.ts";

export interface Tag {
  id: number;
  name: string;
}
export const isTag = is.ObjectOf({
  id: is.Number,
  name: is.String,
}) satisfies P<Tag>;

export interface TagSummary {
  name: string;
}
export const isTagSummary = is.ObjectOf({
  name: is.String,
}) satisfies P<TagSummary>;

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request("GET", "/tags", is.ArrayOf(isTag));
  }
}
