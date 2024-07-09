import { ensureDir } from "jsr:@std/fs@0.229.3";
import { join } from "jsr:@std/path@0.225.2";

async function getCacheDirectoryName() {
  const localAppData = Deno.env.get("LOCALAPPDATA");
  if (localAppData) {
    return join(localAppData, "denops-docbase");
  }

  const home = Deno.env.get("HOME");
  if (home) {
    return join(home, ".cache", "denops-docbase");
  }

  return await Deno.makeTempDir({ prefix: "denops-docbase-" });
}

async function getCacheDirectory() {
  const cacheDir = await getCacheDirectoryName();
  await ensureDir(cacheDir);
  return cacheDir;
}

export async function getCacheFile(domain: string, postId: string) {
  return join(await getCacheDirectory(), `${domain}-${postId}.cache`);
}
