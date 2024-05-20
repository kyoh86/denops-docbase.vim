import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

export interface UserSummary {
  id: number;
  name: string;
  profile_image_url: string;
}
export const isUserSummary = is.ObjectOf({
  id: is.Number,
  name: is.String,
  profile_image_url: is.String,
}) satisfies P<UserSummary>;
