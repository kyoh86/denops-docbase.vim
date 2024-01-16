import {
  is,
  ObjectOf as O,
  Predicate as P,
} from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";
import { Fetcher } from "../fetcher.ts";

const UploadAttachmentParamsFields = {
  name: is.String,
  content: is.String,
};
export type UploadAttachmentParams = O<typeof UploadAttachmentParamsFields>;
export const isUploadAttachmentParams: P<UploadAttachmentParams> = is.ObjectOf(
  UploadAttachmentParamsFields,
);

const AttachmentFields = {
  id: is.String,
  name: is.String,
  size: is.Number,
  url: is.String,
  markdown: is.String,
  created_at: is.String,
};

export interface Attachment extends O<typeof AttachmentFields> {
  _?: unknown;
}
export const isAttachment: P<Attachment> = is.ObjectOf(AttachmentFields);

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
