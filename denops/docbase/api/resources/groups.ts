import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { isUserSummary, UserSummary } from "./user_summary.ts";
import { isGroupSummary } from "./group_summary.ts";
import { Fetcher } from "../fetcher.ts";
import { Stringer } from "../types.ts";

export interface CreateGroupParams {
  name: string;
  description?: string | undefined;
}
export const isCreateGroupParams = is.ObjectOf({
  name: is.String,
  description: is.OptionalOf(is.String),
}) satisfies P<CreateGroupParams>;

export type SearchGroupsParams = {
  name?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
};
export const isSearchGroupsParams = is.ObjectOf({
  name: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
}) satisfies P<SearchGroupsParams>;

export interface JoinGroupParams {
  user_ids: number[];
}
export const isJoinGroupParams = is.ObjectOf({
  user_ids: is.ArrayOf(is.Number),
}) satisfies P<JoinGroupParams>;

export type KickGroupParams = JoinGroupParams;
export const isKickGroupParams = isJoinGroupParams satisfies P<KickGroupParams>;

export interface Group {
  id: number;
  name: string;
  description: string;
  posts_count: number;
  last_activity_at: string;
  created_at: string;
  users: UserSummary[];
}
export const isGroup = is.ObjectOf({
  id: is.Number,
  name: is.String,
  description: is.String,
  posts_count: is.Number,
  last_activity_at: is.String,
  created_at: is.String,
  users: is.ArrayOf(isUserSummary),
}) satisfies P<Group>;

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
