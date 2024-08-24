import { as, is, type Predicate as P } from "jsr:@core/unknownutil@~4.3.0";
import type { Fetcher } from "../fetcher.ts";
import { isUserSummary, type UserSummary } from "./user_summary.ts";

export interface CreateCommentParams {
  body: string;
  notice?: boolean | undefined;
}
export const isCreateCommentParams: P<CreateCommentParams> = is.ObjectOf({
  body: is.String,
  notice: as.Optional(is.Boolean),
});

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: UserSummary;
}
export const isComment: P<Comment> = is.ObjectOf({
  id: is.Number,
  body: is.String,
  created_at: is.String,
  user: isUserSummary,
});

export class Comments {
  constructor(private fetcher: Fetcher, private memoId: number) {}

  create(body: CreateCommentParams) {
    return this.fetcher.request(
      "POST",
      `/posts/${this.memoId}/comments`,
      isComment,
      { body },
    );
  }

  delete(id: number) {
    return this.fetcher.call("DELETE", `/comments/${id}`);
  }
}
