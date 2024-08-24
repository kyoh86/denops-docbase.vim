import { is, type Predicate as P } from "jsr:@core/unknownutil@~4.3.0";
import type { Fetcher } from "../fetcher.ts";

export interface Tag {
  id: number;
  name: string;
}
export const isTag: P<Tag> = is.ObjectOf({
  id: is.Number,
  name: is.String,
});

export interface TagSummary {
  name: string;
}
export const isTagSummary: P<TagSummary> = is.ObjectOf({
  name: is.String,
});

export class Tags {
  constructor(private fetcher: Fetcher) {}

  list() {
    return this.fetcher.request("GET", "/tags", is.ArrayOf(isTag));
  }
}
