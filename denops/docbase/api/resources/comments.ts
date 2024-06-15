import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { isUserSummary, UserSummary } from "./user_summary.ts";

export interface CreateCommentParams {
  body: string;
  notice?: boolean | undefined;
}
export const isCreateCommentParams = is.ObjectOf({
  body: is.String,
  notice: is.OptionalOf(is.Boolean),
}) satisfies P<CreateCommentParams>;

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: UserSummary;
}
export const isComment = is.ObjectOf({
  id: is.Number,
  body: is.String,
  created_at: is.String,
  user: isUserSummary,
}) satisfies P<Comment>;

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
