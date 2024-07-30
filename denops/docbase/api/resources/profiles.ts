import { is, type Predicate as P } from "jsr:@core/unknownutil@3.18.1";
import type { Fetcher } from "../fetcher.ts";
import { type GroupSummary, isGroupSummary } from "./group_summary.ts";

export interface Profile {
  id: number;
  name: string;
  username: string;
  profile_image_url: string;
  role: string;
  posts_count: number;
  last_access_time: string;
  two_step_authentication: boolean;
  groups: GroupSummary[];
  email: string;
  nameid: string;
}
export const isProfile: P<Profile> = is.ObjectOf({
  id: is.Number,
  name: is.String,
  username: is.String,
  profile_image_url: is.String,
  role: is.String,
  posts_count: is.Number,
  last_access_time: is.String,
  two_step_authentication: is.Boolean,
  groups: is.ArrayOf(isGroupSummary),
  email: is.String,
  nameid: is.String,
});

export async function get(fetcher: Fetcher) {
  return await fetcher.request("GET", "/profile", isProfile);
}

export class Profiles {
  constructor(private fetcher: Fetcher) {}

  get() {
    return get(this.fetcher);
  }
}
