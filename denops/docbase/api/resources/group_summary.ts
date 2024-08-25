import { is, type Predicate as P } from "jsr:@core/unknownutil@~4.3.0";

export interface GroupSummary {
  id: number;
  name: string;
}
export const isGroupSummary: P<GroupSummary> = is.ObjectOf({
  id: is.Number,
  name: is.String,
});
