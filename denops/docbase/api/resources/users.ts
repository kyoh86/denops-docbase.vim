import { is, type Predicate as P } from "jsr:@core/unknownutil@3.18.1";
import type { Fetcher } from "../fetcher.ts";
import { type GroupSummary, isGroupSummary } from "./group_summary.ts";
import type { Stringer } from "../types.ts";

export type SearchUsersParams = {
  q?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
  include_user_groups?: boolean | undefined;
};
export const isSearchUsersParams: P<SearchUsersParams> = is.ObjectOf({
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
  include_user_groups: is.OptionalOf(is.Boolean),
});

export interface User {
  id: number;
  name: string;
  username: string;
  profile_image_url: string;
  role: string;
  posts_count: number;
  last_access_time: string;
  two_step_authentication: boolean;
  groups: GroupSummary[];
}
export const isUser: P<User> = is.ObjectOf({
  id: is.Number,
  name: is.String,
  username: is.String,
  profile_image_url: is.String,
  role: is.String,
  posts_count: is.Number,
  last_access_time: is.String,
  two_step_authentication: is.Boolean,
  groups: is.ArrayOf(isGroupSummary),
});

export class Users {
  constructor(private fetcher: Fetcher) {}

  search(params: SearchUsersParams) {
    const query = new Map<string, Stringer | string>();
    const parameters = params as Record<string, string | number | boolean>;
    for (const key in parameters) {
      query.set(key, parameters[key]);
    }
    return this.fetcher.request("GET", `/users`, is.ArrayOf(isUser), { query });
  }
}
