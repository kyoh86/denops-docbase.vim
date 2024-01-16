import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";
import { isUserSummary } from "./user_summary.ts";
import { isGroupSummary } from "./group_summary.ts";
import { Fetcher } from "../fetcher.ts";

const CreateGroupParamsFields = {
  name: is.String,
  description: is.OptionalOf(is.String),
};
export type CreateGroupParams = O<typeof CreateGroupParamsFields>;
export const isCreateGroupParams: P<CreateGroupParams> = is.ObjectOf(
  CreateGroupParamsFields,
);

const SearchGroupsParamsFields = {
  name: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
};
export type SearchGroupsParams = O<typeof SearchGroupsParamsFields>;
export const isSearchGroupsParams: P<SearchGroupsParams> = is.ObjectOf(
  SearchGroupsParamsFields,
);

const JoinGroupParamsFields = {
  user_ids: is.ArrayOf(is.Number),
};
export type JoinGroupParams = O<typeof JoinGroupParamsFields>;
export const isJoinGroupParams: P<JoinGroupParams> = is.ObjectOf(
  JoinGroupParamsFields,
);

export type KickGroupParams = JoinGroupParams;
export const isKickGroupParams: P<KickGroupParams> = isJoinGroupParams;

const GroupFields = {
  id: is.Number,
  name: is.String,
  description: is.String,
  posts_count: is.Number,
  last_activity_at: is.String,
  created_at: is.String,
  users: is.ArrayOf(isUserSummary),
};
export interface Group extends O<typeof GroupFields> {
  _?: unknown;
}
export const isGroup: P<Group> = is.ObjectOf(GroupFields);

export class Groups {
  constructor(private fetcher: Fetcher) {}

  create(body: CreateGroupParams) {
    return this.fetcher.request("POST", `/groups`, isGroup, { body });
  }

  search(params: SearchGroupsParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, string | number>;
    for (const key in parameters) {
      query[key] = parameters[key].toString();
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
