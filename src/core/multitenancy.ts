import { QueryTypes } from "sequelize";
import Company from "../apps/(dashboard)/company/models";
import Perspective from "../apps/(dashboard)/perspectives/models";
import User from "../apps/users/models/user";
import { debugLog } from "../utils/debugLog";
import sequelize from "./orm";

export const getTenantModel = (model: any, tenantSchema: string): any => {
  return model.schema(tenantSchema, { schemaDelimiter: "." });
};

export async function getTenantSchemas() {
  const [schemas] = await sequelize.query(
    `SELECT schema_name FROM information_schema.schemata 
     WHERE schema_name NOT IN ('public', 'pg_catalog', 'information_schema', 'pg_toast')
     AND schema_name NOT LIKE 'pg_%';`
  );

  return schemas.map((s: any) => s.schema_name);
}

export const createTenantSchema = async (tenantId: string) => {
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}";`);

  debugLog(tenantId, "created successfully");
};

export const checkIfSchemaExists = async (schemaName: string) => {
  const result = await sequelize.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name = :schemaName;`,
    { replacements: { schemaName }, type: QueryTypes.SELECT }
  );
  return result.length > 0;
};

export const deleteTenantSchema = async (tenantId: string) => {
  await sequelize.query(`DROP SCHEMA IF EXISTS "${tenantId}" CASCADE;`);
};

// Function to sync schemas
export async function syncSchemas() {
  try {
    debugLog("Synchronizing Public Schema(s)");

    const modelsToSync = [User, Company];

    for (const model of modelsToSync) {
      await model.sync({ alter: true });
      debugLog(`✅ ${model.name} synchronized.`);
    }

    const tenantSchemas = await getTenantSchemas();

    for (const schema of tenantSchemas) {
      debugLog(`🔄 Syncing Tenant schema ${schema}`);

      const TenantUser = getTenantModel(User, schema);
      const TenantPerspective = getTenantModel(Perspective, schema);

      const modelsToSync = [User, Company, TenantUser, TenantPerspective];

      for (const model of modelsToSync) {
        await model.sync({ alter: true });
        debugLog(`✅ ${model.name} synchronized.`);
      }
    }
  } catch (error) {
    debugLog("❌ Error syncing tenant schemas:", error);
  }
}
