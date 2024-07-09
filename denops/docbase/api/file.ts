import { encodeBase64 } from "jsr:@std/encoding@1.0.1";

export async function encode_content(filename: string) {
  return encodeBase64(await Deno.readFile(filename));
}
