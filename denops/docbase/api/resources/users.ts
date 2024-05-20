import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { GroupSummary, isGroupSummary } from "./group_summary.ts";
import { Stringer } from "../types.ts";

export type SearchUsersParams = {
  q?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
  include_user_groups?: boolean | undefined;
};
export const isSearchUsersParams = is.ObjectOf({
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
  include_user_groups: is.OptionalOf(is.Boolean),
}) satisfies P<SearchUsersParams>;

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
export const isUser = is.ObjectOf({
  id: is.Number,
  name: is.String,
  username: is.String,
  profile_image_url: is.String,
  role: is.String,
  posts_count: is.Number,
  last_access_time: is.String,
  two_step_authentication: is.Boolean,
  groups: is.ArrayOf(isGroupSummary),
}) satisfies P<User>;

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
