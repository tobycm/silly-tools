import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import ip from "./routes/ip";
import paste from "./routes/paste";
import secret from "./routes/secret";

const app = new Elysia()
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )

  .use(
    swagger({
      documentation: {
        info: {
          title: "Toby's Silly API",
          description: "A collection of silly but useful API endpoints.",
          version: "1.0.0",
        },
      },
    })
  )

  .get("/", () => "Hello Elysia")

  .use(ip)
  .use(secret)
  .use(paste)

  .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
