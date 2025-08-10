import Elysia, { t } from "elysia";

const publicPastes = new Map<string, string>();
const privatePastes = new Map<string, string>();

setInterval(() => {
  publicPastes.clear();
}, 1000 * 60 * 60 * 24 * 3);

setInterval(() => {
  privatePastes.clear();
}, 1000 * 60 * 60 * 24 * 7);

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
  .get("/", () => publicPastes)
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
  .post(
    "/",
    ({ body }) => {
      const id = crypto.randomUUID();
      const content = typeof body === "string" ? body : body.content;

      privatePastes.set(id, content);

      return { id };
    },
    { body: "Paste" }
  )
  .post(
    "/:id",
    ({ params, body, set }) => {
      const id = params.id;
      const content = typeof body === "string" ? body : body.content;

      if (publicPastes.has(id) || privatePastes.has(id)) {
        set.status = 400;
        return { error: "Paste ID already exists" };
      }

      publicPastes.set(id, content);

      return { id };
    },
    { params: "ID", body: "Paste" }
  )
  .post(
    "/public",
    ({ body }) => {
      const id = crypto.randomUUID();
      const content = typeof body === "string" ? body : body.content;

      publicPastes.set(id, content);

      return { id };
    },
    { body: "Paste" }
  )
  .post(
    "/public/:id",
    ({ params, body, set }) => {
      const id = params.id;
      const content = typeof body === "string" ? body : body.content;

      if (publicPastes.has(id)) {
        set.status = 400;
        return { error: "Public paste ID already exists" };
      }

      publicPastes.set(id, content);

      return { id };
    },
    { params: "ID", body: "Paste" }
  );
