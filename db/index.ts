

import {
  createAuthor,
  deleteAuthor,
  getAuthor,
  listAuthors,
} from "./query_sql";
import { client } from "../server";


async function main() {
  // list all authors
  const authors = await listAuthors(client);
  console.log(authors);

  // create an author
  const author = await createAuthor(client, {
    name: "Anders Hejlsberg",
    bio: "Original author of Turbo Pascal and co-creator of TypeScript",
  });
  if (author === null) {
    throw new Error("author not created");
  }
  console.log(author);

  // get the author we just created
  const anders = await getAuthor(client, { id: author.id });
  if (anders === null) {
    throw new Error("anders not found");
  }
  console.log(anders);

  // delete the author
  await deleteAuthor(client, { id: anders.id });
}

(async () => {
  await main();
  process.exit();
})();
