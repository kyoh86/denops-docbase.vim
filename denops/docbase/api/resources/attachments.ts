import { is, type Predicate as P } from "jsr:@core/unknownutil@~4.0.0";
import type { Fetcher } from "../fetcher.ts";

export interface UploadAttachmentParams {
  name: string;
  content: string;
}
export const isUploadAttachmentParams: P<UploadAttachmentParams> = is.ObjectOf({
  name: is.String,
  content: is.String,
});

export interface Attachment {
  id: string;
  name: string;
  size: number;
  url: string;
  markdown: string;
  created_at: string;
}

export const isAttachment: P<Attachment> = is.ObjectOf({
  id: is.String,
  name: is.String,
  size: is.Number,
  url: is.String,
  markdown: is.String,
  created_at: is.String,
});

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
