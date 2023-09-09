import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const CommentFields = {
  id: is.Number,
  body: is.String,
  notice: is.Boolean,
  author_id: is.Number,
  published_at: is.String,
  memo_id: is.Number,
};

export const CommentPredicate = is.ObjectOf(CommentFields);

export type Comment = ObjectOf<typeof CommentFields>;

export class Comments {
  constructor(private fetcher: Fetcher, private memoId: number) {}

  create(comment: Comment) {
    return this.fetcher.request<Comment>(
      "POST",
      `/posts/${this.memoId}/comments`,
      comment,
    );
  }

  delete(id: number) {
    return this.fetcher.call("DELETE", `/comments/${id}`);
  }
}
