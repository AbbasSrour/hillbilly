import "reflect-metadata";
import { config } from "dotenv";

// Set test environment before loading env vars
if (process.env.NODE_ENV !== "test") {
  Object.defineProperty(process.env, "NODE_ENV", {
    value: "test",
    writable: true,
    configurable: true,
  });
}

// Load test environment variables
config({ path: ".env.test" });
