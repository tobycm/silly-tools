import { randomUUIDv5, randomUUIDv7 } from "bun";
import { randomBytes, randomUUID } from "crypto";
import Elysia, { t } from "elysia";

export default new Elysia({ prefix: "/generate" })
  .model(
    "UUIDv7Options",
    t.Object({
      encoding: t.Optional(
        t.Union([t.Literal("base64"), t.Literal("hex"), t.Literal("url")], {
          description: "Encoding format for UUIDv7",
        })
      ),
      timestamp: t.Optional(
        t.Union([t.Date(), t.Number()], {
          description: "Timestamp for UUIDv7",
        })
      ),
    })
  )

  .get(
    "/",
    ({ query }) => {
      const { encoding, timestamp } = query;
      return randomUUIDv7(encoding === "url" ? "base64url" : encoding, timestamp);
    },
    {
      query: "UUIDv7Options",
    }
  )
  .post(
    "/",
    ({ body }) => {
      const { encoding, timestamp } = body;
      return randomUUIDv7(encoding === "url" ? "base64url" : encoding, timestamp);
    },
    {
      body: "UUIDv7Options",
    }
  )

  .get(
    "/uuid",
    ({ query }) => {
      const { encoding, timestamp } = query;
      return randomUUIDv7(encoding === "url" ? "base64url" : encoding, timestamp);
    },
    {
      query: "UUIDv7Options",
    }
  )

  .get(
    "/uuid/bulk",
    ({ query }) => {
      const { amount = 50 } = query;
      return Array.from({ length: amount }, () => randomUUIDv7());
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of UUIDs to generate", default: 50, maximum: 1000000 })),
      }),
    }
  )

  .get(
    "/uuid/v4",
    () => {
      return randomUUID();
    },
    {
      description: "Generate a UUIDv4",
    }
  )

  .get(
    "/uuid/v4/bulk",
    ({ query }) => {
      const { amount = 50 } = query;
      return Array.from({ length: amount }, () => randomUUID());
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of UUIDs to generate", default: 50, maximum: 1000000 })),
      }),
    }
  )

  .model(
    "UUIDv5Options",
    t.Object({
      namespace: t.String({ description: "Namespace for UUIDv5" }),
      name: t.String({ description: "Name for UUIDv5" }),
    })
  )

  .get(
    "/uuid/v5",
    ({ query }) => {
      const { namespace, name } = query;
      return randomUUIDv5(name, namespace);
    },
    {
      query: "UUIDv5Options",
    }
  )

  .get(
    "/uuid/v5/bulk",
    ({ query }) => {
      const { data } = query;
      return data.map(({ namespace, name }) => randomUUIDv5(name, namespace));
    },
    {
      query: t.Object({
        data: t.Array(
          t.Object({
            namespace: t.String({ description: "Namespace for UUIDv5" }),
            name: t.String({ description: "Name for UUIDv5" }),
          })
        ),
      }),
    }
  )

  .get(
    "/uuid/v7",
    ({ query }) => {
      const { encoding } = query;

      return randomUUIDv7(encoding === "url" ? "base64url" : encoding);
    },
    {
      query: "UUIDv7Options",
    }
  )

  .get(
    "/uuid/v7/bulk",
    ({ query }) => {
      const { amount = 50, encoding, timestamp } = query;

      return Array.from({ length: amount }, () => randomUUIDv7(encoding === "url" ? "base64url" : encoding, timestamp));
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of UUIDv7s to generate", default: 50, maximum: 1000000 })),
        encoding: t.Optional(
          t.Union([t.Literal("base64"), t.Literal("hex"), t.Literal("url")], {
            description: "Encoding format for UUIDv7",
            default: "hex",
          })
        ),
        timestamp: t.Optional(
          t.Union([t.Date(), t.Number()], {
            description: "Timestamp for UUIDv7",
          })
        ),
      }),
    }
  )

  .get(
    "/number",
    ({ query }) => {
      const { min = 0, max = 1000000 } = query;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    {
      query: t.Object({
        min: t.Optional(t.Number({ description: "Minimum number", default: 0 })),
        max: t.Optional(t.Number({ description: "Maximum number", default: 1000000 })),
      }),
    }
  )

  .get(
    "/number/bulk",
    ({ query }) => {
      const { amount = 50, min = 0, max = 1000000 } = query;
      return Array.from({ length: amount }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random numbers to generate", default: 50, maximum: 1000000 })),
        min: t.Optional(t.Number({ description: "Minimum number", default: 0 })),
        max: t.Optional(t.Number({ description: "Maximum number", default: 1000000 })),
      }),
    }
  )

  .get(
    "/string",
    ({ query }) => {
      const { length = 10, charset = "alphanumeric" } = query;
      const charsets = {
        alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        numeric: "0123456789",
        hex: "0123456789abcdef",
        base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      };
      const characters = charsets[charset] || charsets.alphanumeric;
      return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
    },
    {
      query: t.Object({
        length: t.Optional(t.Number({ description: "Length of the random string", default: 10 })),
        charset: t.Optional(
          t.Union([t.Literal("alphanumeric"), t.Literal("alphabetic"), t.Literal("numeric"), t.Literal("hex"), t.Literal("base64")], {
            description: "Character set to use",
            default: "alphanumeric",
          })
        ),
      }),
    }
  )

  .get(
    "/string/bulk",
    ({ query }) => {
      const { amount = 50, length = 10, charset = "alphanumeric" } = query;
      const charsets = {
        alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        numeric: "0123456789",
        hex: "0123456789abcdef",
        base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      };
      const characters = charsets[charset] || charsets.alphanumeric;
      return Array.from({ length: amount }, () => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join(""));
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random strings to generate", default: 50, maximum: 1000000 })),
        length: t.Optional(t.Number({ description: "Length of each random string", default: 10 })),
        charset: t.Optional(
          t.Union([t.Literal("alphanumeric"), t.Literal("alphabetic"), t.Literal("numeric"), t.Literal("hex"), t.Literal("base64")], {
            description: "Character set to use",
            default: "alphanumeric",
          })
        ),
      }),
    }
  )

  .get("/boolean", () => Math.random() < 0.5)

  .get(
    "/boolean/bulk",
    ({ query }) => {
      const { amount = 50 } = query;
      return Array.from({ length: amount }, () => Math.random() < 0.5);
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random booleans to generate", default: 50, maximum: 1000000 })),
      }),
    }
  )

  .get(
    "/date",
    ({ query }) => {
      const { start, end } = query;
      const startDate = new Date(start || "1970-01-01");
      const endDate = new Date(end || new Date());
      return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    },
    {
      query: t.Object({
        start: t.Optional(t.String({ description: "Start date in ISO format", default: "1970-01-01" })),
        end: t.Optional(t.String({ description: "End date in ISO format", default: new Date().toISOString() })),
      }),
    }
  )

  .get(
    "/date/bulk",
    ({ query }) => {
      const { amount = 50, start, end } = query;
      const startDate = new Date(start || "1970-01-01");
      const endDate = new Date(end || new Date());
      return Array.from({ length: amount }, () => new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())));
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random dates to generate", default: 50, maximum: 1000000 })),
        start: t.Optional(t.String({ description: "Start date in ISO format", default: "1970-01-01" })),
        end: t.Optional(t.String({ description: "End date in ISO format", default: new Date().toISOString() })),
      }),
    }
  )

  .get(
    "/color",
    ({ query }) => {
      const { format = "hex" } = query;
      const randomColor = () => Math.floor(Math.random() * 256);
      if (format === "rgb") {
        return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
      } else if (format === "rgba") {
        return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, ${Math.random().toFixed(2)})`;
      } else {
        return `#${((1 << 24) + (randomColor() << 16) + (randomColor() << 8) + randomColor()).toString(16).slice(1)}`;
      }
    },
    {
      query: t.Object({
        format: t.Optional(t.String({ description: "Color format", default: "hex" })),
      }),
    }
  )

  .get(
    "/color/bulk",
    ({ query }) => {
      const { amount = 50, format = "hex" } = query;
      const randomColor = () => Math.floor(Math.random() * 256);
      return Array.from({ length: amount }, () => {
        if (format === "rgb") {
          return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
        } else if (format === "rgba") {
          return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, ${Math.random().toFixed(2)})`;
        } else {
          return `#${((1 << 24) + (randomColor() << 16) + (randomColor() << 8) + randomColor()).toString(16).slice(1)}`;
        }
      });
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random colors to generate", default: 50, maximum: 1000000 })),
        format: t.Optional(t.String({ description: "Color format", default: "hex" })),
      }),
    }
  )

  .get(
    "/bytes",
    ({ query }) => {
      const { length = 16 } = query;
      return randomBytes(length).toString("hex");
    },
    {
      query: t.Object({
        length: t.Optional(t.Number({ description: "Length of the random byte array", default: 16, maximum: 50 * 1024 * 1024 })),
      }),
    }
  )

  .get(
    "/bytes/bulk",
    ({ query }) => {
      const { amount = 50, length = 16 } = query;

      if (amount * length > 50 * 1024 * 1024) throw new Error("Total size exceeds 50MB limit");

      return Array.from({ length: amount }, () => randomBytes(length).toString("hex"));
    },
    {
      query: t.Object({
        amount: t.Optional(t.Number({ description: "Number of random byte arrays to generate", default: 50, maximum: 1000000 })),
        length: t.Optional(t.Number({ description: "Length of each random byte array", default: 16, maximum: 1024 * 1024 })),
      }),
    }
  );
