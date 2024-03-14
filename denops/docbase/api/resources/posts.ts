import {
  is,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

import { isTagSummary, TagSummary } from "./tags.ts";
import { isUserSummary, UserSummary } from "./user_summary.ts";
import { Comment, isComment } from "./comments.ts";
import { GroupSummary, isGroupSummary } from "./group_summary.ts";
import { Attachment, isAttachment } from "./attachments.ts";

export type Scope = "everyone" | "group" | "private";
export const isScope: P<Scope> = is.UnionOf([
  is.LiteralOf("everyone"),
  is.LiteralOf("group"),
  is.LiteralOf("private"),
]);

const SearchPostsParamsFields = {
  q: is.OptionalOf(is.String),
  page: is.OptionalOf(is.Number),
  per_page: is.OptionalOf(is.Number),
};
export type SearchPostsParams = {
  q?: string | undefined;
  page?: number | undefined;
  per_page?: number | undefined;
};
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
  scope: is.UnionOf([is.LiteralOf("everyone"), is.LiteralOf("private")]),
};
export type CreatePostParams =
  & (
    | {
      scope: "group";
      groups: number[];
    }
    | {
      scope: "everyone" | "private";
    }
  )
  & {
    title: string;
    body: string;
    draft?: boolean | undefined;
    notice?: boolean | undefined;
    tags?: string[] | undefined;
  };
export const isCreatePostParams: P<CreatePostParams> = is.UnionOf([
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
  scope: is.UnionOf([is.LiteralOf("everyone"), is.LiteralOf("private")]),
};
interface UpdatePostParamsCommon {
  title?: string;
  body?: string;
  draft?: boolean;
  notice?: boolean;
  tags?: string[];
}
export type UpdatePostParams =
  & UpdatePostParamsCommon
  & (Record<never, never> | { scope?: "group"; groups: number[] } | {
    scope: "everyone" | "private";
  });
export const isUpdatePostParams: P<UpdatePostParams> = is.UnionOf([
  is.ObjectOf(updatePostParamsFields),
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
  scope: is.UnionOf([isScope, is.Null]),
  tags: is.ArrayOf(isTagSummary),
  sharing_url: is.UnionOf([is.String, is.Null]),
  representative_image_url: is.UnionOf([is.String, is.Null]),
  user: isUserSummary,
  stars_count: is.Number,
  good_jobs_count: is.Number,
  comments: is.ArrayOf(isComment),
  groups: is.ArrayOf(isGroupSummary),
  attachments: is.ArrayOf(isAttachment),
};
export interface Post {
  id: number;
  title: string;
  body: string;
  draft: boolean;
  archived: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  scope: Scope | null;
  tags: TagSummary[];
  sharing_url: string | null;
  representative_image_url: string | null;
  user: UserSummary;
  stars_count: number;
  good_jobs_count: number;
  comments: Comment[];
  groups: GroupSummary[];
  attachments: Attachment[];
}
export const isPost: P<Post> = is.ObjectOf(PostFields);

const SearchPostsMetaFields = {
  previous_page: is.UnionOf([is.String, is.Null]),
  next_page: is.UnionOf([is.String, is.Null]),
  total: is.Number,
};
export interface SearchPostsMeta {
  previous_page: string | null;
  next_page: string | null;
  total: number;
}
export const isSearchPostsMeta: P<SearchPostsMeta> = is.ObjectOf(
  SearchPostsMetaFields,
);

export class Posts {
  constructor(private fetcher: Fetcher) {}

  search(params: SearchPostsParams) {
    const query: Record<string, string> = {};
    const parameters = params as Record<string, object>;
    for (const key in parameters) {
      if (parameters[key]) {
        query[key] = parameters[key].toString();
      }
    }
    return this.fetcher.request(
      "GET",
      `/posts`,
      is.ObjectOf({
        posts: is.ArrayOf(isPost),
        meta: isSearchPostsMeta,
      }),
      { query },
    );
  }

  create(body: CreatePostParams) {
    return this.fetcher.request("POST", `/posts`, isPost, { body });
  }

  get(id: string) {
    return this.fetcher.request("GET", `/posts/${id}`, isPost);
  }

  update(id: string, body: UpdatePostParams) {
    return this.fetcher.request("PATCH", `/posts/${id}`, isPost, { body });
  }

  archive(id: string) {
    return this.fetcher.call("PUT", `/posts/${id}/archive`);
  }

  delete(id: string) {
    return this.fetcher.call("DELETE", `/posts/${id}`);
  }
}
