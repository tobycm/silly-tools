import Elysia, { t } from "elysia";
import { mkdirSync } from "fs";
import { Level } from "level";
import path from "path";

const publicPastes = new Level("../data/publicPastes", { valueEncoding: "json" });
const privatePastes = new Level("../data/privatePastes", { valueEncoding: "json" });
const filePastes = new Level("../data/filePastes", { valueEncoding: "json" });

mkdirSync("../data/files", { recursive: true });

export default new Elysia({ prefix: "/paste" })
  .model({
    ID: t.Object({
      id: t.String({ pattern: "^[a-zA-Z0-9-]+$", maxLength: 128 }),
    }),
    Paste: t.Union([
      t.String({ maxLength: 1024 * 1024 }),
      t.Object({
        content: t.String({ maxLength: 1024 * 1024 }),
      }),
      t.File({ maxSize: 1024 * 1024 * 10 }), // 10MB max file size
    ]),
  })
  .get(
    "/:id",
    async ({ params, set }) => {
      const paste = (await privatePastes.get(params.id)) || (await publicPastes.get(params.id));
      if (!paste) {
        const file = await filePastes.get(params.id);
        if (file) {
          set.headers["content-disposition"] = `attachment; filename="${file}"`;
          set.headers["content-type"] = "application/octet-stream";
          return Bun.file(path.join("../data/files", file));
        }

        set.status = 404;
        return { error: "Paste not found" };
      }

      return { id: params.id, content: paste };
    },
    { params: "ID" }
  )
  .get(
    "/public/:id",
    async ({ params, set }) => {
      const paste = (await publicPastes.get(params.id)) || (await privatePastes.get(params.id));
      if (!paste) {
        const file = await filePastes.get(params.id);
        if (file) {
          set.headers["content-disposition"] = `attachment; filename="${file}"`;
          set.headers["content-type"] = "application/octet-stream";
          return Bun.file(path.join("../data/files", file));
        }

        set.status = 404;
        return { error: "Paste not found" };
      }

      return { id: params.id, content: paste };
    },
    { params: "ID" }
  )
  .post(
    "/",
    async ({ body }) => {
      const id = crypto.randomUUID();

      if (!(typeof body === "string") && !("content" in body)) {
        const file = Bun.file(path.join("../data/files", `${id}-${body.name}`));
        file.write(await body.arrayBuffer());
        filePastes.put(id, `${id}-${body.name}`);
        return { id };
      }

      const content = typeof body === "string" ? body : body.content;

      privatePastes.put(id, content);

      return { id };
    },
    { body: "Paste" }
  )
  .post(
    "/:id",
    async ({ params, body, set }) => {
      const id = params.id;

      if (!(typeof body === "string") && !("content" in body)) {
        const file = Bun.file(path.join("../data/files", `${id}-${body.name}`));
        file.write(await body.arrayBuffer());
        filePastes.put(id, `${id}-${body.name}`);
        return { id };
      }

      if ((await publicPastes.has(id)) || (await privatePastes.has(id))) {
        set.status = 400;
        return { error: "Paste ID already exists" };
      }

      const content = typeof body === "string" ? body : body.content;

      privatePastes.put(id, content);

      return { id };
    },
    { params: "ID", body: "Paste" }
  )
  .post(
    "/public",
    async ({ body }) => {
      const id = crypto.randomUUID();

      if (!(typeof body === "string") && !("content" in body)) {
        const file = Bun.file(path.join("../data/files", `${id}-${body.name}`));
        file.write(await body.arrayBuffer());
        filePastes.put(id, `${id}-${body.name}`);
        return { id };
      }

      const content = typeof body === "string" ? body : body.content;

      publicPastes.put(id, content);

      return { id };
    },
    { body: "Paste" }
  )
  .post(
    "/public/:id",
    async ({ params, body, set }) => {
      const id = params.id;

      if (!(typeof body === "string") && !("content" in body)) {
        const file = Bun.file(path.join("../data/files", `${id}-${body.name}`));
        file.write(await body.arrayBuffer());
        filePastes.put(id, `${id}-${body.name}`);
        return { id };
      }

      const content = typeof body === "string" ? body : body.content;

      if (await publicPastes.has(id)) {
        set.status = 400;
        return { error: "Public paste ID already exists" };
      }

      publicPastes.put(id, content);

      return { id };
    },
    { params: "ID", body: "Paste" }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const id = params.id;

      if (!(await publicPastes.has(id)) && !(await privatePastes.has(id))) {
        set.status = 404;
        return { error: "Paste not found" };
      }

      if (!(typeof body === "string") && !("content" in body)) {
        const file = Bun.file(path.join("../data/files", `${id}-${body.name}`));
        file.write(await body.arrayBuffer());
        filePastes.put(id, `${id}-${body.name}`);
        return { id };
      }

      const content = typeof body === "string" ? body : body.content;

      if (await publicPastes.has(id)) {
        publicPastes.put(id, content);
      } else {
        privatePastes.put(id, content);
      }

      return { id };
    },
    {
      params: t.Object({
        id: t.String({ pattern: "^[a-zA-Z0-9-]+$", minLength: 32, maxLength: 128 }),
      }),
      body: "Paste",
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const id = params.id;

      if (await publicPastes.has(id)) {
        await publicPastes.del(id);
        return { success: true };
      }
      if (await privatePastes.has(id)) {
        await privatePastes.del(id);
        return { success: true };
      }

      if (await filePastes.has(id)) {
        const fileName = await filePastes.get(id);
        Bun.file(path.join("../data/files", fileName)).unlink();
        await filePastes.del(id);
        return { success: true };
      }

      set.status = 404;
      return { error: "Paste not found" };
    },
    {
      params: t.Object({
        id: t.String({ pattern: "^[a-zA-Z0-9-]+$", minLength: 32, maxLength: 128 }),
      }),
    }
  );
