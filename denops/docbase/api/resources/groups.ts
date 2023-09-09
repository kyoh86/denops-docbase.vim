import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { UserSummaryPredicate } from "./user_summary.ts";
import { GroupSummary } from "./group_summary.ts";
import { Fetcher } from "../fetcher.ts";

const CreateGroupParamsFields = {
  name: is.String,
  description: is.OptionalOf(is.String),
};

export const CreateGroupParamsPredicate = is.ObjectOf(CreateGroupParamsFields);

export type CreateGroupParams = ObjectOf<typeof CreateGroupParamsFields>;

const SearchGroupsParamsFields = {
  name: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
};

export const SearchGroupsParamsPredicate = is.ObjectOf(
  SearchGroupsParamsFields,
);

export type SearchGroupsParams = ObjectOf<typeof SearchGroupsParamsFields>;

const JoinGroupParamsFields = {
  user_ids: is.ArrayOf(is.Number),
};

export const JoinGroupParamsPredicate = is.ObjectOf(JoinGroupParamsFields);

export type JoinGroupParams = ObjectOf<typeof JoinGroupParamsFields>;

export const KickGroupParamsPredicate = JoinGroupParamsPredicate;

export type KickGroupParams = JoinGroupParams;

const GroupFields = {
  id: is.Number,
  name: is.String,
  description: is.String,
  posts_count: is.Number,
  last_activity_at: is.String,
  created_at: is.String,
  users: is.ArrayOf(UserSummaryPredicate),
};
export const GroupPredicate = is.ObjectOf(GroupFields);

export type Group = ObjectOf<typeof GroupFields>;

export class Groups {
  constructor(private fetcher: Fetcher) {}

  create(body: CreateGroupParams) {
    return this.fetcher.request<Group>("POST", `/groups`, { body });
  }

  search(params: SearchGroupsParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, string | number>;
    for (const key in parameters) {
      query[key] = parameters[key].toString();
    }
    return this.fetcher.request<GroupSummary[]>("GET", `/groups`, {
      query,
    });
  }

  get(id: string) {
    return this.fetcher.request<Group>("GET", `/groups/${id}`);
  }

  join(id: string, body: JoinGroupParams) {
    return this.fetcher.call("POST", `/groups/${id}/users`, { body });
  }

  kick(id: string, body: KickGroupParams) {
    return this.fetcher.call("DELETE", `/groups/${id}/users`, { body });
  }
}
