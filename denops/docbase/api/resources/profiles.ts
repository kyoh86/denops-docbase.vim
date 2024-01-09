import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.13.0/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { isGroupSummary } from "./group_summary.ts";

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
export interface Profile extends O<typeof ProfileFields> {
  _?: unknown;
}
export const isProfile: P<Profile> = is.ObjectOf(ProfileFields);

export class Profiles {
  constructor(private fetcher: Fetcher) {}

  get() {
    return this.fetcher.request("GET", "/profile", isProfile);
  }
}
