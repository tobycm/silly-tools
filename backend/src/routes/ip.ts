import Elysia from "elysia";
import { ip } from "elysia-ip";

export default new Elysia({ prefix: "/ip" })
  .use(ip({}))
  .get("/", ({ ip, server, request, set }) => {
    const address = ip || server?.requestIP(request)?.address;

    if (!address) {
      set.status = 500;
      return "error: Unable to determine IP address";
    }

    return address;
  })
  .get("/json", ({ ip, server, request, set }) => {
    const address = ip || server?.requestIP(request);

    if (!address) {
      set.status = 500;
      return { error: "Unable to determine IP address" };
    }

    return { ip: address };
  });
