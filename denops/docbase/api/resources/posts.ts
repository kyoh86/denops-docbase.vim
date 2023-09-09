import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

import { TagPredicate } from "./tags.ts";
import { UserSummaryPredicate } from "./user_summary.ts";
import { CommentPredicate } from "./comments.ts";
import { GroupSummaryPredicate } from "./group_summary.ts";
import { AttachmentPredicate } from "./attachments.ts";

export const ScopePredicate = is.LiteralOneOf([
  "everyone",
  "group",
  "primitive",
]);

export type Scope = "everyone" | "group" | "private";
const SearchPostsParamsFields = {
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
};

export const SearchPostsParamsPredicate = is.ObjectOf(SearchPostsParamsFields);

export type SearchPostsParams = ObjectOf<typeof SearchPostsParamsFields>;

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

export const CreatePostParamsPredicate = is.OneOf([
  is.ObjectOf(createPostParamsForGroupsFields),
  is.ObjectOf(createPostParamsForOthersFields),
]);

export type CreatePostParams =
  | ObjectOf<typeof createPostParamsForGroupsFields>
  | ObjectOf<typeof createPostParamsForOthersFields>;

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

export const UpdatePostParamsPredicate = is.OneOf([
  is.ObjectOf(updatePostParamsForGroupsFields),
  is.ObjectOf(updatePostParamsForOthersFields),
]);

export type UpdatePostParams =
  | ObjectOf<typeof updatePostParamsForGroupsFields>
  | ObjectOf<typeof updatePostParamsForOthersFields>;

const PostFields = {
  id: is.Number,
  title: is.String,
  body: is.String,
  draft: is.Boolean,
  archived: is.Boolean,
  url: is.String,
  created_at: is.String,
  updated_at: is.String,
  tags: is.ArrayOf(TagPredicate),
  scope: ScopePredicate,
  sharing_url: is.String,
  representative_image_url: is.String,
  user: UserSummaryPredicate,
  stars_count: is.Number,
  good_jobs_count: is.Number,
  comments: is.ArrayOf(CommentPredicate),
  groups: is.ArrayOf(GroupSummaryPredicate),
  attachments: is.ArrayOf(AttachmentPredicate),
};

export const PostPredicate = is.ObjectOf(PostFields);

export type Post = ObjectOf<typeof PostFields>;
export class Posts {
  constructor(private fetcher: Fetcher) {}

  search(params: SearchPostsParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, object>;
    for (const key in parameters) {
      query[key] = parameters[key].toString();
    }
    return this.fetcher.request<
      { posts: Post[]; meta: Record<string, unknown> }
    >("GET", `/posts`, query);
  }

  create(post: CreatePostParams) {
    return this.fetcher.request<Post>("POST", `/posts`, post);
  }

  get(id: string) {
    return this.fetcher.request<Post>("POST", `/posts/${id}`);
  }

  update(id: string, post: UpdatePostParams) {
    return this.fetcher.request<Post>("POST", `/posts/${id}`, post);
  }

  archive(id: string) {
    return this.fetcher.call("PUT", `/posts/${id}/archive`);
  }

  delete(id: string) {
    return this.fetcher.call("DELETE", `/posts/${id}`);
  }
}
