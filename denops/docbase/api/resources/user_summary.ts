import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";

const UserSummaryFields = {
  id: is.Number,
  name: is.String,
  profile_image_url: is.String,
};
export interface UserSummary extends O<typeof UserSummaryFields> {
  _?: unknown;
}
export const isUserSummary: P<UserSummary> = is.ObjectOf(UserSummaryFields);
