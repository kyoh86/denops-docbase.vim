import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

export interface GroupSummary {
  id: number;
  name: string;
}
export const isGroupSummary = is.ObjectOf({
  id: is.Number,
  name: is.String,
}) satisfies P<GroupSummary>;
