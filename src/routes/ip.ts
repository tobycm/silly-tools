import Elysia from "elysia";
import { ip } from "elysia-ip";

export default new Elysia({ prefix: "/ip" })
  .use(ip({}))
  .get("/", ({ ip }) => {
    return ip;
  })
  .get("/json", ({ ip }) => {
    return { ip };
  });
