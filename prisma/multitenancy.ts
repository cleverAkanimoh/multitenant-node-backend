import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const globalPrismaClients = new Map<string, PrismaClient>();

export const getCompanyPrisma = (req: Request): PrismaClient => {
  const companySchema = req.headers["x-company-shortname"] as string;

  const DB_PASS = process.env.DB_PASS || "";
  const DB_HOST = process.env.DB_HOST || "";
  const DB_NAME = process.env.DB_NAME || "";
  const DB_USER = process.env.DB_USER || "";

  console.log(DB_HOST, DB_NAME, DB_PASS, DB_USER);

  if (!companySchema) {
    throw new Error(
      "company shortName is required in the 'x-company-shortname' header."
    );
  }

  if (!globalPrismaClients.has(companySchema)) {
    globalPrismaClients.set(
      companySchema,
      new PrismaClient({
        datasources: {
          db: {
            url: `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?schema=${companySchema}`,
          },
        },
      })
    );
  }

  return globalPrismaClients.get(companySchema)!;
};
