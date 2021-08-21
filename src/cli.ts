#!/usr/bin/env node

import { protoc } from './index';

const [, , ...args] = process.argv;

protoc(
  args,
  {
    encoding: "buffer",
  },
  (err, output) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.stdout.write(output);
  }
);
