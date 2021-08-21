import { library } from './index';

((): void => {
  library(["./type.proto"], (err, files) => {
    console.table(err);
    console.table(files);
  });
})();
