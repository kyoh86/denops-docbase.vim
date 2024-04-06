import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.17.2/mod.ts";

const GroupSummaryFields = {
  id: is.Number,
  name: is.String,
};
export interface GroupSummary {
  id: number;
  name: string;
}
export const isGroupSummary: P<GroupSummary> = is.ObjectOf(
  GroupSummaryFields,
);
