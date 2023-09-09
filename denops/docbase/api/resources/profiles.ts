import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { GroupSummaryPredicate } from "./group_summary.ts";

const ProfileFields = {
  id: is.Number,
  name: is.String,
  username: is.String,
  profile_image_url: is.String,
  role: is.String,
  posts_count: is.Number,
  last_access_time: is.String,
  two_step_authentication: is.Boolean,
  groups: is.ArrayOf(GroupSummaryPredicate),
  email: is.String,
  nameid: is.String,
};

export const ProfilePredicate = is.ObjectOf(ProfileFields);

export type Profile = ObjectOf<typeof ProfileFields>;

export class Profiles {
  constructor(private fetcher: Fetcher) {}

  get() {
    return this.fetcher.request<Profile>("GET", "/profile");
  }
}
