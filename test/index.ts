import { dbTest } from "./db.test";

dbTest();

(async () => {
  await dbTest();
  process.exit();
})();
