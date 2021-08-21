import {
  execFile,
  ExecFileException,
  ExecFileOptionsWithBufferEncoding,
} from 'child_process';
import * as cuid from 'cuid';
import { existsSync, readFile, readFileSync, rmdir, unlink } from 'fs';
import { glob } from 'glob';
import * as mkdirp from 'mkdirp';
import { join } from 'path';
import * as rimraf from 'rimraf';
import * as Vinyl from 'vinyl';

import { protocPath } from './protocPath';

export const protoc = (
  args: ReadonlyArray<string> | undefined | null,
  options: ExecFileOptionsWithBufferEncoding,
  callback: (
    error: ExecFileException | null,
    stdout: Buffer,
    stderr: Buffer
  ) => void
): void => {
  execFile(protocPath, args, options, callback);
};

// interface IOptionsInterace {
//   imports: any[];
//   outputPath: string;
// }
// export const closure = (
//   files: any[],
//   options: IOptionsInterace,
//   callback: () => void
// ) => {
//   if (!callback) {
//     callback = options;
//     options = null;
//   }

//   options.imports = options.imports || [];
//   options.outputPath = options.outputPath || "./";

//   const cwd = process.cwd();
//   const absoluteOutputPath = resolve(cwd, options.outputPath);
//   const relativePath = relative(absoluteOutputPath, cwd);

//   const args = ["--js_out=one_output_file_per_input_file,binary:."];

//   for (let i = 0; i < options.imports.length; i++) {
//     args.push("-I", join(relativePath, options.imports[i]));
//   }

//   for (let i = 0; i < files.length; i++) {
//     args.push(join(relativePath, files[i]));
//   }

//   native(options.outputPath, (error) => {
//     if (error) return callback(error);

//     protoc(
//       args,
//       {
//         cwd: options.outputPath,
//       },
//       callback
//     );
//   });
// };

/**
 * Converts .proto files to .js files that can be used in Google Closure Compiler.
 */
export const library = (
  files: string[],
  callback: (Error?: Error, files?: Vinyl.BufferFile[]) => void
): void => {
  const dirpath = "tmp";
  const filename = cuid();
  const jsFile = join(dirpath, filename);
  mkdirp("tmp")
    .then(() => {
      const args = ["--js_out=library=" + jsFile + ",binary:."].concat(files);
      protoc(
        args,
        {
          encoding: "buffer",
        },
        (error) => {
          if (error) return callback(error);

          if (existsSync(jsFile + ".js")) {
            readFile(jsFile + ".js", (error, contents) => {
              if (error) return callback(error);

              unlink(jsFile + ".js", (error) => {
                if (error) return callback(error);

                rmdir(dirpath, () => {
                  callback(undefined, [
                    new Vinyl({
                      cwd: "/",
                      base: "/",
                      path: filename + ".js",
                      contents: contents,
                    }),
                  ]);
                });
              });
            });
          } else {
            glob(
              "**/*.js",
              {
                cwd: jsFile,
              },
              (error, matches) => {
                if (error) return callback(error, undefined);

                const files = matches.map((match) => {
                  return new Vinyl({
                    cwd: "/",
                    base: "/",
                    path: match,
                    contents: readFileSync(join(jsFile, match)),
                  });
                });

                rimraf(jsFile, (error) => {
                  if (error) return callback(error);

                  rmdir(dirpath, () => {
                    callback(undefined, files);
                  });
                });
              }
            );
          }
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
};
