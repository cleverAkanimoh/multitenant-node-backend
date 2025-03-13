import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const globalPrismaClients = new Map<string, PrismaClient>();

export const getTenantPrisma = (req: Request): PrismaClient => {
  const tenantSchema = req.headers["x-tenant-id"] as string;

  const DB_PASS = process.env.DB_PASS;
  const DB_HOST = process.env.DB_HOST;
  const DB_NAME = process.env.DB_NAME;
  const DB_USER = process.env.DB_USER;

  if (!tenantSchema) {
    throw new Error("Tenant ID is required in the 'x-tenant-id' header.");
  }

  if (!globalPrismaClients.has(tenantSchema)) {
    globalPrismaClients.set(
      tenantSchema,
      new PrismaClient({
        datasources: {
          db: {
            url: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?schema=${tenantSchema}`,
          },
        },
      })
    );
  }

  return globalPrismaClients.get(tenantSchema)!;
};
