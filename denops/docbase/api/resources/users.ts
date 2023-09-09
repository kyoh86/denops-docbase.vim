import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { GroupSummaryPredicate } from "./group_summary.ts";

const SearchUsersParamsFields = {
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
  include_user_groups: is.OptionalOf(is.Boolean),
};

export const SearchUsersParamsPredicate = is.ObjectOf(SearchUsersParamsFields);

export type SearchUsersParams = ObjectOf<typeof SearchUsersParamsFields>;

const UserFields = {
  id: is.Number,
  name: is.String,
  username: is.String,
  profile_image_url: is.String,
  role: is.String,
  posts_count: is.Number,
  last_access_time: is.String,
  two_step_authentication: is.Boolean,
  groups: is.ArrayOf(GroupSummaryPredicate),
};

export const UserPredicate = is.ObjectOf(UserFields);

export type User = ObjectOf<typeof UserFields>;
export class Users {
  constructor(private fetcher: Fetcher) {}

  search(params: SearchUsersParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, string | number | boolean>;
    for (const key in parameters) {
      query[key] = parameters[key].toString();
    }
    return this.fetcher.request<User[]>("GET", `/users`, { query });
  }
}
