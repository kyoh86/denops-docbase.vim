import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.18.0/mod.ts";
import { Fetcher } from "../fetcher.ts";
import { isUserSummary, UserSummary } from "./user_summary.ts";

const CreateCommentParamsFields = {
  body: is.String,
  notice: is.OptionalOf(is.Boolean),
};
export interface CreateCommentParams {
  body: string;
  notice?: boolean | undefined;
}
export const isCreateCommentParams: P<CreateCommentParams> = is
  .ObjectOf(
    CreateCommentParamsFields,
  );

const CommentFields = {
  id: is.Number,
  body: is.String,
  created_at: is.String,
  user: isUserSummary,
};
export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: UserSummary;
}
export const isComment: P<Comment> = is.ObjectOf(CommentFields);

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
