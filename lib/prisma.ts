import { PrismaClient } from "@prisma/client";

// Add a type declaration for globalThis._prisma
declare global {
  var _prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  console.log("Creating new Prisma client instance...");
  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
    errorFormat: "pretty",
  });
}

const prisma = globalThis._prisma ?? createPrismaClient();

if (process.env.NODE_ENV === "development") {
  globalThis._prisma = prisma;
  console.log("💾 Prisma client stored globally for development reuse");
} else {
  console.log("🚀 Production: Using fresh Prisma client instance");
}

async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log("❌ Prisma client disconnected successfully");
  } catch (error) {
    console.log("⚠️ Error disconnecting Prisma client:", error);
    process.exit(1);
  }
}

process.on("SIGINT", disconnectPrisma);
process.on("SIGTERM", disconnectPrisma);
process.on("beforeExit", disconnectPrisma);

export default prisma;