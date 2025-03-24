import { debugLog } from "../utils/debugLog";
import sequelize from "./orm";

export const ensureTenantSchema = async (tenantSchema: string) => {
  debugLog("creating new schema for ", tenantSchema);

  return await sequelize.query(
    `CREATE SCHEMA IF NOT EXISTS "${tenantSchema}";`
  );
};
