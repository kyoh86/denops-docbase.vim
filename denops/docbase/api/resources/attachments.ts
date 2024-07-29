import { is, type Predicate as P } from "jsr:@core/unknownutil@3.18.1";
import type { Fetcher } from "../fetcher.ts";

export interface UploadAttachmentParams {
  name: string;
  content: string;
}
export const isUploadAttachmentParams = is.ObjectOf({
  name: is.String,
  content: is.String,
}) satisfies P<UploadAttachmentParams>;

export interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  markdown: string;
  created_at: string;
}

export const isAttachment = is.ObjectOf({
  id: is.String,
  name: is.String,
  size: is.Number,
  url: is.String,
  markdown: is.String,
  created_at: is.String,
}) satisfies P<Attachment>;

export class Attachments {
  constructor(private fetcher: Fetcher) {}

  async create(body: UploadAttachmentParams[]) {
    return await this.fetcher.request(
      "POST",
      `/attachments`,
      is.ArrayOf(isAttachment),
      { body },
    );
  }
}
