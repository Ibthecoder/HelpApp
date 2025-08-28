//import from  prisma client:.:
//PrismaClient is the main class that gives you access to your database:.:
import { PrismaClient } from "@prisma/client";

//Step 1: i Prevent multiple instances of Prisma Client in development:.:
declare global {
  // We use 'var' because it creates function-scoped variables that can be global:.:
  // 'let' or 'const' would be block-scoped and wouldn't work for global access:.:
  var _prisma: PrismaClient | undefined;
}

//Step 2: i Create a Function that build our Prisma client:.:
function createPrismaClient() {
  console.log("Creating new Prisma client instance...");

  return new PrismaClient({
    //Development mode: will log all queries to the console,Show all database queries for debugging:.:
    //Production mode: will only log errors,Reduce logging in production for performance, to avoid log spam:.:
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],

    //Pretty format for errors, making them easier to read and understand:.:
    errorFormat: "pretty",
  });
}

//Step 3: i Create a Prisma client instance that will be reused across the app:.:
// If YES: reuse it (prevents "too many clients" error):.:
// If NO: create a new one:.:
const prisma = globalThis._prisma ?? createPrismaClient(); // using singleton here :

/**
 * STEP 4:i  Store the connection globally ONLY in development:.:
 *

 */
if (process.env.NODE_ENV === "development") {
  //Development: Store connection globally so hot reloads can reuse it:.:
  globalThis._prisma = prisma;
  console.log(" Prisma client stored globally for development reuse");
} else {
  //Production: DON'T store globally (fresh connections prevent memory leaks):.:
  console.log(" Production: Using fresh Prisma client instance");
}

//Step 5 i want to clean up database connections when the app shuts down becuase of memory leaks:.:
async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log(" Prisma client disconnected successfully");
  } catch (error) {
    console.log(" Error disconnecting Prisma client:", error);
    // Exit with error code to signal something went wrong:.:
    process.exit(1); // Exit with failure code:.:
  }
}

// Listen for different ways the app can shut down:.
process.on("SIGINT", disconnectPrisma);
process.on("SIGTERM", disconnectPrisma);
process.on("beforeExit", disconnectPrisma);

export default prisma;
