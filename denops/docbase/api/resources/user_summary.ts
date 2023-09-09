import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
const UserSummaryFields = {
  id: is.Number,
  name: is.String,
  profile_image_url: is.String,
};

export const UserSummaryPredicate = is.ObjectOf(UserSummaryFields);

export type UserSummary = ObjectOf<typeof UserSummaryFields>;
