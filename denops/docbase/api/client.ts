import { Posts } from './resources/posts.ts';
import { Profiles } from './resources/profiles.ts';
import { Users } from './resources/users.ts';
import { Groups } from './resources/groups.ts';
import { Comments } from './resources/comments.ts';
import { Tags } from './resources/tags.ts';
import { Fetcher } from './fetcher.ts';
import { Attachments } from './resources/attachments.ts';

export class Client {
	private fetcher: Fetcher;
	constructor(apiToken: string, domain: string) {
		this.fetcher = new Fetcher(apiToken, domain);
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

	comments(memoId: number): Comments {
		return new Comments(this.fetcher, memoId);
	}
}
