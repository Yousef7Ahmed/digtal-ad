import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";

await connectDB();

const server = app.listen(env.port, () => {
  console.log(`🚀 السيرفر شغّال على http://localhost:${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  console.log(`\n${signal} — بقفل السيرفر...`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  server.close(() => process.exit(1));
});
