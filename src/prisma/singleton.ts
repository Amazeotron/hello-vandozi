// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const internalPrisma = new PrismaClient({
  // Optional: Configure logging for development
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
}).$extends(withAccelerate());

// Extend the global object to hold the PrismaClient instance in development
// This prevents multiple instances during hot-reloading in development environments
const globalForPrisma = globalThis as unknown as {
  prisma: typeof internalPrisma | undefined;
};

// Create or retrieve the single PrismaClient instance
export const prisma = globalForPrisma.prisma ?? internalPrisma;

// In development, store the instance on the global object
// This ensures that hot-reloading doesn't create new instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
