import { mkdir } from "fs/promises";

import Elysia, { t } from "elysia";
import path from "path";
import { commitAndPushChanges } from "../lib/git";

const PUBLIC_GIT_REPO_PATH = process.env.PUBLIC_GIT_REPO_PATH!;
if (!PUBLIC_GIT_REPO_PATH) throw new Error("PUBLIC_GIT_REPO_PATH is not set");

let dirty = false;

setInterval(() => {
  if (!dirty) return;
  dirty = false;

  commitAndPushChanges(PUBLIC_GIT_REPO_PATH, `Invalidate secrets at ${new Date().toISOString()}`);
}, 1000 * 7);

setInterval(() => {
  commitAndPushChanges(PUBLIC_GIT_REPO_PATH, `Invalidate secrets at ${new Date().toISOString()}`);
}, 1000 * 60 * 5); // rare race condition, but should be fine

async function addSecret(secret: string) {
  const now = new Date();

  const todayFolder = path.join(PUBLIC_GIT_REPO_PATH, "secrets", now.getFullYear().toString(), (now.getMonth() + 1).toString());

  await mkdir(todayFolder, { recursive: true });

  let increment = 0;

  let file = Bun.file(path.join(todayFolder, `${now.toISOString().toString()}.txt`));

  while (file.size > 1024 * 1024 * 5) {
    increment++;
    file = Bun.file(path.join(todayFolder, `${now.toISOString().toString()}-${increment}.txt`));
  }

  await Bun.write(file, secret);
}

export default new Elysia({ prefix: "/secret" })
  .macro({
    dirty: () => ({
      afterResponse: () => {
        dirty = true;
      },
    }),
  })
  .get(
    "/invalidate",
    async ({ query }) => {
      const { secret } = query;

      await addSecret(secret);

      return { message: "Secret queued for invalidation" };
    },
    {
      description: "Invalidate a secret",
      query: t.Object({
        secret: t.String({ maxLength: 1024 * 4 }),
      }),
      dirty: true,
    }
  )
  .post(
    "/invalidate",
    async ({ body }) => {
      if (typeof body === "string") {
        body = { secret: body };
      }

      const { secret } = body;

      await addSecret(secret);

      return { message: "Secret queued for invalidation" };
    },
    {
      description: "Invalidate a secret",
      body: t.Union([
        t.String({ maxLength: 1024 * 8 }),
        t.Object({
          secret: t.String({ maxLength: 1024 * 8 }),
        }),
      ]),
      dirty: true,
    }
  );
