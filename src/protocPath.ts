import { join } from 'path';

const protoc_bin = join(__dirname, "protoc", "bin");

export const protocPath = join(
  protoc_bin,
  "protoc" + (process.platform === "win32" ? ".exe" : "")
);
