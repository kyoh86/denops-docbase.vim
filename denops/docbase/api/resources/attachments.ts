import { is, ObjectOf } from "https://deno.land/x/unknownutil@v3.6.0/mod.ts";
import { Fetcher } from "../fetcher.ts";

const UploadAttachmentParamsFields = {
  name: is.String,
  content: is.String,
};

export const UploadAttachmentParamsPredicate = is.ObjectOf(
  UploadAttachmentParamsFields,
);

export type UploadAttachmentParams = ObjectOf<
  typeof UploadAttachmentParamsFields
>;

const AttachmentFields = {
  id: is.String,
  name: is.String,
  size: is.Number,
  url: is.String,
  markdown: is.String,
  created_at: is.String,
};

export const AttachmentPredicate = is.ObjectOf(AttachmentFields);

export type Attachment = ObjectOf<typeof AttachmentFields>;

export class Attachments {
  constructor(private fetcher: Fetcher) {}

  async create(body: UploadAttachmentParams) {
    return await this.fetcher.request<Attachment>(
      "POST",
      `/attachments`,
      { body },
    );
  }
}
