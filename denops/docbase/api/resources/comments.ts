import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const CreateCommentParamsFields = {
  body: is.String,
  notice: is.OptionalOf(is.Boolean),
};
export type CreateCommentParams = O<typeof CreateCommentParamsFields>;
export const isCreateCommentParams: P<CreateCommentParams> = is.ObjectOf(
  CreateCommentParamsFields,
);

const CommentFields = {
  id: is.Number,
  body: is.String,
  notice: is.Boolean,
  author_id: is.Number,
  published_at: is.String,
  memo_id: is.Number,
};
export interface Comment extends O<typeof CommentFields> {
  _?: unknown;
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
