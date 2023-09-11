import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

import { isTag } from "./tags.ts";
import { isUserSummary } from "./user_summary.ts";
import { isComment } from "./comments.ts";
import { isGroupSummary } from "./group_summary.ts";
import { isAttachment } from "./attachments.ts";

export type Scope = "everyone" | "group" | "private";
export const isScope: P<Scope> = is.OneOf([
  is.LiteralOf("everyone"),
  is.LiteralOf("group"),
  is.LiteralOf("private"),
]);

const SearchPostsParamsFields = {
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
};
export type SearchPostsParams = O<typeof SearchPostsParamsFields>;
export const isSearchPostsParams: P<SearchPostsParams> = is.ObjectOf(
  SearchPostsParamsFields,
);

const createPostParamsFields = {
  title: is.String,
  body: is.String,
  draft: is.OptionalOf(is.Boolean),
  notice: is.OptionalOf(is.Boolean),
  tags: is.OptionalOf(is.ArrayOf(is.String)),
};
const createPostParamsForGroupsFields = {
  ...createPostParamsFields,
  scope: is.LiteralOf("group"),
  groups: is.ArrayOf(is.Number),
};
const createPostParamsForOthersFields = {
  ...createPostParamsFields,
  scope: is.OneOf([is.LiteralOf("everyone"), is.LiteralOf("private")]),
};
export type CreatePostParams =
  | O<typeof createPostParamsForGroupsFields>
  | O<typeof createPostParamsForOthersFields>;
export const isCreatePostParams: P<CreatePostParams> = is.OneOf([
  is.ObjectOf(createPostParamsForGroupsFields),
  is.ObjectOf(createPostParamsForOthersFields),
]);

const updatePostParamsFields = {
  title: is.OptionalOf(is.String),
  body: is.OptionalOf(is.String),
  draft: is.OptionalOf(is.Boolean),
  notice: is.OptionalOf(is.Boolean),
  tags: is.OptionalOf(is.ArrayOf(is.String)),
};
const updatePostParamsForGroupsFields = {
  ...updatePostParamsFields,
  scope: is.OptionalOf(is.LiteralOf("group")),
  groups: is.ArrayOf(is.Number),
};
const updatePostParamsForOthersFields = {
  ...updatePostParamsFields,
  scope: is.OneOf([is.LiteralOf("everyone"), is.LiteralOf("private")]),
};
export type UpdatePostParams =
  | O<typeof updatePostParamsForGroupsFields>
  | O<typeof updatePostParamsForOthersFields>;
export const isUpdatePostParams: P<UpdatePostParams> = is.OneOf([
  is.ObjectOf(updatePostParamsForGroupsFields),
  is.ObjectOf(updatePostParamsForOthersFields),
]);

const PostFields = {
  id: is.Number,
  title: is.String,
  body: is.String,
  draft: is.Boolean,
  archived: is.Boolean,
  url: is.String,
  created_at: is.String,
  updated_at: is.String,
  tags: is.ArrayOf(isTag),
  scope: isScope,
  sharing_url: is.String,
  representative_image_url: is.String,
  user: isUserSummary,
  stars_count: is.Number,
  good_jobs_count: is.Number,
  comments: is.ArrayOf(isComment),
  groups: is.ArrayOf(isGroupSummary),
  attachments: is.ArrayOf(isAttachment),
};
export interface Post extends O<typeof PostFields> {
  _?: unknown;
}
export const isPost: P<Post> = is.ObjectOf(PostFields);

export class Posts {
  constructor(private fetcher: Fetcher) {}

  search(params: SearchPostsParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, object>;
    for (const key in parameters) {
      query[key] = parameters[key].toString();
    }
    return this.fetcher.request(
      "GET",
      `/posts`,
      is.ObjectOf({
        posts: is.ArrayOf(isPost),
        meta: is.Record,
      }),
      query,
    );
  }

  create(post: CreatePostParams) {
    return this.fetcher.request("POST", `/posts`, isPost, post);
  }

  get(id: string) {
    return this.fetcher.request("GET", `/posts/${id}`, isPost);
  }

  update(id: string, post: UpdatePostParams) {
    return this.fetcher.request("POST", `/posts/${id}`, isPost, post);
  }

  archive(id: string) {
    return this.fetcher.call("PUT", `/posts/${id}/archive`);
  }

  delete(id: string) {
    return this.fetcher.call("DELETE", `/posts/${id}`);
  }
}
