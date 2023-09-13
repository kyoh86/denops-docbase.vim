export type Response = {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly error?: string;
};

export type ResponseWithBody<T> = Response & { body: T };

export type {
  Attachment,
  UploadAttachmentParams,
} from "./resources/attachments.ts";

export type { Comment } from "./resources/comments.ts";

export type {
  CreateGroupParams,
  Group,
  JoinGroupParams,
  KickGroupParams,
  SearchGroupsParams,
} from "./resources/groups.ts";
export type { GroupSummary } from "./resources/group_summary.ts";

export type {
  CreatePostParams,
  Post,
  Scope,
  SearchPostsMeta,
  SearchPostsParams,
  UpdatePostParams,
} from "./resources/posts.ts";

export type { Profile } from "./resources/profiles.ts";

export type { Tag } from "./resources/tags.ts";

export type { User } from "./resources/users.ts";
export type { UserSummary } from "./resources/user_summary.ts";
