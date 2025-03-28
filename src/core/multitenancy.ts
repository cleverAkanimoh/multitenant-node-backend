import { debugLog } from "../utils/debugLog";
import sequelize from "./orm";

export const getTenantModel = (model: any, tenantSchema: string): any => {
  return model.schema(tenantSchema, { schemaDelimiter: "." });
};

export const createTenantSchema = async (tenantId: string) => {
  const newSchema = await sequelize.query(
    `CREATE SCHEMA IF NOT EXISTS "${tenantId}";`
  );

  debugLog(tenantId, " created successfully", { newSchema });
};

export const deleteTenantSchema = async (tenantId: string) => {
  await sequelize.query(`DROP SCHEMA IF EXISTS "${tenantId}" CASCADE;`);
};
