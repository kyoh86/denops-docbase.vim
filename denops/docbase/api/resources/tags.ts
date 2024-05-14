import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { Fetcher } from "../fetcher.ts";

const TagFields = {
  id: is.Number,
  name: is.String,
};
export interface Tag {
  id: number;
  name: string;
}
export const isTag: P<Tag> = is.ObjectOf(TagFields);

const TagSummaryFields = {
  name: is.String,
};
export interface TagSummary {
  name: string;
}
export const isTagSummary: P<TagSummary> = is.ObjectOf(
  TagSummaryFields,
);

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request("GET", "/tags", is.ArrayOf(isTag));
  }
}
