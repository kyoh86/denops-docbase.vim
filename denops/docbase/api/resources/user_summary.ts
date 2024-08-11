import { is, type Predicate as P } from "jsr:@core/unknownutil@~4.1.0";

export interface UserSummary {
  id: number;
  name: string;
  profile_image_url: string;
}
export const isUserSummary: P<UserSummary> = is.ObjectOf({
  id: is.Number,
  name: is.String,
  profile_image_url: is.String,
});
