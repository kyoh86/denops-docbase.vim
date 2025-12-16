import { is, type Predicate as P } from "@core/unknownutil";

export interface GroupSummary {
  id: number;
  name: string;
}
export const isGroupSummary: P<GroupSummary> = is.ObjectOf({
  id: is.Number,
  name: is.String,
});
