import { is, Predicate as P } from "jsr:@core/unknownutil@3.18.1";

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
