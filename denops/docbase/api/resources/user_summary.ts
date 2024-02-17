import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.16.3/mod.ts";

const UserSummaryFields = {
  id: is.Number,
  name: is.String,
  profile_image_url: is.String,
};
export interface UserSummary {
  id: number;
  name: string;
  profile_image_url: string;
}
export const isUserSummary: P<UserSummary> = is.ObjectOf(UserSummaryFields);
