import { fromUint8Array } from "https://deno.land/x/base64@v0.2.1/mod.ts";

export async function encode_content(filename: string) {
  return fromUint8Array(await Deno.readFile(filename));
}
