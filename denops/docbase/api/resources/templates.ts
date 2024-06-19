// Apply template to the text
// See: https://help.docbase.io/posts/15787
import { Fetcher } from "../fetcher.ts";
import { get, Profile } from "./profiles.ts";

let cached: Profile | undefined = undefined;

async function getProfile(fetcher: Fetcher) {
  if (!cached) {
    const res = await get(fetcher);
    cached = res.body;
  }
  return cached;
}

export class Templates {
  #today = new Date();
  constructor(private fetcher: Fetcher) {}

  #fixed_vars: Record<string, () => Promise<unknown>> = {
    "name": async () => (await getProfile(this.fetcher)).name,
    "me": async () => (await getProfile(this.fetcher)).name,
    "id": async () => (await getProfile(this.fetcher)).id,
    "hour": () => Promise.resolve(this.#today.getHours()),
    "hours": () => Promise.resolve(this.#today.getHours()),
    "minute": () => Promise.resolve(this.#today.getMinutes()),
    "minutes": () => Promise.resolve(this.#today.getMinutes()),
    "second": () => Promise.resolve(this.#today.getSeconds()),
    "seconds": () => Promise.resolve(this.#today.getSeconds()),
    "emoji": () => Promise.resolve("👍"), // TODO: Random emoji
    "avatar": async () => (await getProfile(this.fetcher)).profile_image_url,
    "icon": async () => (await getProfile(this.fetcher)).profile_image_url,
  };

  addDateVar(d: Date, delta: string | undefined, unit: string | undefined) {
    const newDate = new Date(d.getTime());
    if (!delta || !unit) {
      return newDate;
    }
    const deltaNum = parseInt(delta);
    switch (unit) {
      case "y":
        newDate.setFullYear(newDate.getFullYear() + deltaNum);
        break;
      case "m":
        newDate.setMonth(newDate.getMonth() + deltaNum);
        break;
      case "newDate":
        newDate.setDate(newDate.getDate() + deltaNum);
        break;
      case "w":
        newDate.setDate(newDate.getDate() + deltaNum * 7);
        break;
    }
    return newDate;
  }

  #date_vars: Record<string, (d: Date) => string | number> = {
    "year": (d: Date) => d.getFullYear() % 100,
    "Year": (d: Date) => d.getFullYear(),
    "month": (d: Date) => d.getMonth() + 1,
    "Month": (d: Date) => d.getMonth() + 1,
    "monthname": (d: Date) => d.toLocaleString("en", { month: "long" }),
    "Monthname": (d: Date) => d.toLocaleString("en", { month: "long" }),
    "day": (d: Date) => d.getDate(),
    "week": (d: Date) => d.getDay(),
    "Week": (d: Date) => d.getDay(),
    "weekday": (d: Date) => d.getDay(), // TODO: Make it name
    "Weekday": (d: Date) => d.getDay(), // TODO: Make it name
    "week_en": (d: Date) => d.toLocaleString("en", { weekday: "short" }),
    "beginning_of_week": (d: Date) => {
      const date = new Date(d.getTime());
      date.setDate(date.getDate() - date.getDay());
      return date.toDateString();
    },
  };

  #fixed_pattern = new RegExp(
    "(%{(" + Object.keys(this.#fixed_vars).join("|") + ")})",
    "g",
  );
  #date_pattern = new RegExp(
    "%{(" + Object.keys(this.#date_vars).join("|") +
      ")(?::([-\\+]\\d+)([ymdw]))?}",
    "g",
  );

  async apply(text: string) {
    text = (await Promise.all(
      text.split(this.#fixed_pattern).map(async (part) => {
        if (!part.match(this.#fixed_pattern)) {
          return part;
        }
        return await this.#fixed_vars
          [part.replace(this.#fixed_pattern, "$2")]();
      }),
    )).join("");
    text = text.replaceAll(this.#date_pattern, (_, p1, p2, p3) => {
      return String(this.#date_vars[p1](this.addDateVar(this.#today, p2, p3)));
    });
    return text;
  }
}
