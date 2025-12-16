import { as, is, type Predicate as P } from "@core/unknownutil";
import type { Fetcher } from "../fetcher.ts";
import { isUserSummary, type UserSummary } from "./user_summary.ts";
import type { Stringer } from "../types.ts";

export interface CreateCommentParams {
  body: string;
  notice?: boolean | undefined;
}
export const isCreateCommentParams: P<CreateCommentParams> = is.ObjectOf({
  body: is.String,
  notice: as.Optional(is.Boolean),
});

export type ListCommentsParams = {
  page?: number | undefined;
  per_page?: number | undefined;
};
export const isListCommentsParams: P<ListCommentsParams> = is.ObjectOf({
  page: as.Optional(is.Number),
  per_page: as.Optional(is.Number),
});

export interface Comment {
  id: number;
  post_id: number;
  url: string;
  body: string;
  created_at: string;
  updated_at: string;
  user: UserSummary;
}
export const isComment: P<Comment> = is.ObjectOf({
  id: is.Number,
  post_id: is.Number,
  url: is.String,
  body: is.String,
  created_at: is.String,
  updated_at: is.String,
  user: isUserSummary,
});

export class Comments {
  constructor(private fetcher: Fetcher, private postId: number) {}

  create(body: CreateCommentParams) {
    return this.fetcher.request(
      "POST",
      `/posts/${this.postId}/comments`,
      isComment,
      { body },
    );
  }

  list(params: ListCommentsParams) {
    const query = new Map<string, Stringer | string>();
    const parameters = params as Record<string, object>;
    for (const key in parameters) {
      if (parameters[key]) {
        query.set(key, parameters[key]);
      }
    }
    return this.fetcher.request(
      "GET",
      `/posts/${this.postId}/comments`,
      is.ArrayOf(isComment),
      { query },
    );
  }

  delete(id: number) {
    return this.fetcher.call("DELETE", `/comments/${id}`);
  }
}
