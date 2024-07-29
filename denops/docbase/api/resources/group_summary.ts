import { is, type Predicate as P } from "jsr:@core/unknownutil@3.18.1";

export interface GroupSummary {
  id: number;
  name: string;
}
export const isGroupSummary = is.ObjectOf({
  id: is.Number,
  name: is.String,
}) satisfies P<GroupSummary>;
