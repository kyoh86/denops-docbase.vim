import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

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
