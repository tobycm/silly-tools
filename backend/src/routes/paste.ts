import Elysia, { t } from "elysia";
import { Level } from "level";

const publicPastes = new Level("../data/publicPastes", { valueEncoding: "json" });
const privatePastes = new Level("../data/privatePastes", { valueEncoding: "json" });

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
    ]),
  })
  .get(
    "/:id",
    ({ params, set }) => {
      const paste = publicPastes.get(params.id) || privatePastes.get(params.id);
      if (!paste) {
        set.status = 404;
        return { error: "Paste not found" };
      }

      return { id: params.id, content: paste };
    },
    { params: "ID" }
  )
  .get(
    "/public/:id",
    ({ params, set }) => {
      const paste = publicPastes.get(params.id) || privatePastes.get(params.id);
      if (!paste) {
        set.status = 404;
        return { error: "Paste not found" };
      }

      return { id: params.id, content: paste };
    },
    { params: "ID" }
  )
  .post(
    "/",
    ({ body }) => {
      const id = crypto.randomUUID();
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
      const content = typeof body === "string" ? body : body.content;

      if ((await publicPastes.has(id)) || (await privatePastes.has(id))) {
        set.status = 400;
        return { error: "Paste ID already exists" };
      }

      publicPastes.put(id, content);

      return { id };
    },
    { params: "ID", body: "Paste" }
  )
  .post(
    "/public",
    ({ body }) => {
      const id = crypto.randomUUID();
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
      const content = typeof body === "string" ? body : body.content;

      if (!(await publicPastes.has(id)) && !(await privatePastes.has(id))) {
        set.status = 404;
        return { error: "Paste not found" };
      }

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

      if (!(await publicPastes.has(id)) && !(await privatePastes.has(id))) {
        set.status = 404;
        return { error: "Paste not found" };
      }

      await publicPastes.del(id);
      await privatePastes.del(id);

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String({ pattern: "^[a-zA-Z0-9-]+$", minLength: 32, maxLength: 128 }),
      }),
    }
  );
