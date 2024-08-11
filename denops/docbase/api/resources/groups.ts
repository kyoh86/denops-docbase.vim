import { as, is, type Predicate as P } from "jsr:@core/unknownutil@~4.1.0";
import { isUserSummary, type UserSummary } from "./user_summary.ts";
import { isGroupSummary } from "./group_summary.ts";
import type { Fetcher } from "../fetcher.ts";
import type { Stringer } from "../types.ts";

export interface CreateGroupParams {
  name: string;
  description?: string | undefined;
}
export const isCreateGroupParams: P<CreateGroupParams> = is.ObjectOf({
  name: is.String,
  description: as.Optional(is.String),
});

export type SearchGroupsParams = {
  name?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
};
export const isSearchGroupsParams: P<SearchGroupsParams> = is.ObjectOf({
  name: as.Optional(is.String),
  page: as.Optional(is.Number),
  per_page: as.Optional(is.Number),
});

export interface JoinGroupParams {
  user_ids: number[];
}
export const isJoinGroupParams: P<JoinGroupParams> = is.ObjectOf({
  user_ids: is.ArrayOf(is.Number),
});

export type KickGroupParams = JoinGroupParams;
export const isKickGroupParams: P<KickGroupParams> = isJoinGroupParams;

export interface Group {
  id: number;
  name: string;
  description: string;
  posts_count: number;
  last_activity_at: string;
  created_at: string;
  users: UserSummary[];
}
export const isGroup: P<Group> = is.ObjectOf({
  id: is.Number,
  name: is.String,
  description: is.String,
  posts_count: is.Number,
  last_activity_at: is.String,
  created_at: is.String,
  users: is.ArrayOf(isUserSummary),
});

export class Groups {
  constructor(private fetcher: Fetcher) {}

  create(body: CreateGroupParams) {
    return this.fetcher.request("POST", `/groups`, isGroup, { body });
  }

  search(params: SearchGroupsParams) {
    const query = new Map<string, Stringer | string>();
    const parameters = params as Record<string, string | number>;
    for (const key in parameters) {
      query.set(key, parameters[key]);
    }
    return this.fetcher.request(
      "GET",
      `/groups`,
      is.ArrayOf(isGroupSummary),
      { query },
    );
  }

  get(id: string) {
    return this.fetcher.request("GET", `/groups/${id}`, isGroup);
  }

  join(id: string, body: JoinGroupParams) {
    return this.fetcher.call("POST", `/groups/${id}/users`, { body });
  }

  kick(id: string, body: KickGroupParams) {
    return this.fetcher.call("DELETE", `/groups/${id}/users`, { body });
  }
}
