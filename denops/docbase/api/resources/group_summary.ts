import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";

const GroupSummaryFields = {
  id: is.Number,
  name: is.String,
};
export const GroupSummaryPredicate = is.ObjectOf(GroupSummaryFields);

export type GroupSummary = ObjectOf<typeof GroupSummaryFields>;
