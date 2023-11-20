import crypto from "crypto";

export function encodeSha256(data: string) {
  const hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}
