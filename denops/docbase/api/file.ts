import { encodeBase64 } from "@std/encoding";

export async function encode_content(filename: string) {
  return encodeBase64(await Deno.readFile(filename));
}
