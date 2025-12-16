import { as, is, type Predicate as P } from "@core/unknownutil";
import type { Fetcher } from "../fetcher.ts";
import type { Stringer } from "../types.ts";
import { isGroup } from "./groups.ts";

export type ListUserGroupsParams = {
  page?: number | undefined;
  per_page?: number | undefined;
};
export const isListUserGroupsParams: P<ListUserGroupsParams> = is.ObjectOf({
  page: as.Optional(is.Number),
  per_page: as.Optional(is.Number),
});

export class UserGroups {
  constructor(private fetcher: Fetcher, private userId: number) {}

  search(params: ListUserGroupsParams) {
    const query = new Map<string, Stringer | string>();
    const parameters = params as Record<string, string | number | boolean>;
    for (const key in parameters) {
      query.set(key, parameters[key]);
    }
    return this.fetcher.request(
      "GET",
      `/users/${this.userId}/groups`,
      is.ArrayOf(isGroup),
      { query },
    );
  }
}
