import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.11.0/mod.ts";

const GroupSummaryFields = {
  id: is.Number,
  name: is.String,
};
export interface GroupSummary extends O<typeof GroupSummaryFields> {
  _?: unknown;
}
export const isGroupSummary: P<GroupSummary> = is.ObjectOf(GroupSummaryFields);
