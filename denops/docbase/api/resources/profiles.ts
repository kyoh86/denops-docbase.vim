import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.0/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { GroupSummary, isGroupSummary } from "./group_summary.ts";

const ProfileFields = {
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
};
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
export const isProfile: P<Profile> = is.ObjectOf(ProfileFields);

export class Profiles {
  constructor(private fetcher: Fetcher) {}

  get() {
    return this.fetcher.request("GET", "/profile", isProfile);
  }
}
