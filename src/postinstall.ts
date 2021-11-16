import { chmod, createWriteStream } from 'fs';
import got from 'got';
import * as mkdirp from 'mkdirp';
import { dirname, join } from 'path';
import { Entry, Parse } from 'unzipper';

import { protocPath } from './protocPath';

const protoVersion = "3.19.1";

const releases: {
  platform:
    | "aix"
    | "darwin"
    | "freebsd"
    | "linux"
    | "openbsd"
    | "sunos"
    | "win32";
  arch:
    | "arm"
    | "arm64"
    | "ia32"
    | "mips"
    | "mipsel"
    | "ppc"
    | "ppc64"
    | "s390"
    | "s390x"
    | "x32"
    | "x64";
  url: string;
}[] = [
  // Linux
  {
    platform: "linux",
    arch: "arm64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-aarch_64.zip`,
  },
  {
    platform: "linux",
    arch: "ppc64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-ppcle_64.zip`,
  },
  {
    platform: "linux",
    arch: "s390",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-s390_64.zip`,
  },
  {
    platform: "linux",
    arch: "x32",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-x86_32.zip`,
  },
  {
    platform: "linux",
    arch: "x64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-x86_64.zip`,
  },
  // OSX
  {
    platform: "darwin",
    arch: "x64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-osx-x86_64.zip`,
  },
  {
    platform: "darwin",
    arch: "x64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-osx-aarch_64.zip`,
  },
  // Windows
  {
    platform: "win32",
    arch: "x32",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-win32.zip`,
  },
  {
    platform: "win32",
    arch: "x64",
    url: `https://github.com/protocolbuffers/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-win64.zip`,
  },
];

const release = releases.find(
  (release) =>
    release.arch === process.arch && release.platform === process.platform
);

if (release) {
  got
    .stream(release.url)
    .pipe(Parse())
    .on("entry", (entry: Entry) => {
      const isFile = entry.type === "File";
      const isDir = entry.type === "Directory";
      const fullpath = join(__dirname, "..", "dist", "protoc", entry.path);
      const directory = isDir ? fullpath : dirname(fullpath);

      void mkdirp(directory).then(() => {
        if (isFile) {
          entry.pipe(createWriteStream(fullpath)).on("finish", function () {
            if (protocPath === fullpath) {
              chmod(fullpath, 755, function (err) {
                if (err) throw err;
              });
            }
          });
        }
      });
    });
} else {
  throw new Error(
    "Unsupported platform. Was not able to find a proper protoc version."
  );
}
