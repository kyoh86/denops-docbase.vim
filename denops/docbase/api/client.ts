import { Attachments } from "./resources/attachments.ts";
import { Fetcher } from "./fetcher.ts";
import { Groups } from "./resources/groups.ts";
import { Posts } from "./resources/posts.ts";
import { Profiles } from "./resources/profiles.ts";
import { Tags } from "./resources/tags.ts";
import { Templates } from "./resources/templates.ts";
import { Users } from "./resources/users.ts";

export class Client {
  private fetcher: Fetcher;
  constructor(apiToken: string, domain: string) {
    this.fetcher = new Fetcher(apiToken, domain);
  }

  templates(): Templates {
    return new Templates(this.fetcher);
  }

  profiles(): Profiles {
    return new Profiles(this.fetcher);
  }

  users(): Users {
    return new Users(this.fetcher);
  }

  posts(): Posts {
    return new Posts(this.fetcher);
  }

  groups(): Groups {
    return new Groups(this.fetcher);
  }

  tags(): Tags {
    return new Tags(this.fetcher);
  }

  attachments(): Attachments {
    return new Attachments(this.fetcher);
  }
}
