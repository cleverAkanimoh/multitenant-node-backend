import { Sequelize } from "sequelize";
import Company from "../apps/(dashboard)/company/models";
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

export const deleteTenantSchema = async (tenantId: string) => {
  await sequelize.query(`DROP SCHEMA IF EXISTS "${tenantId}" CASCADE;`);
};

// Function to sync schemas
export async function syncTenantSchemas() {
  try {
    const tenantSchemas = await getTenantSchemas();

    for (const schema of tenantSchemas) {
      debugLog(`🔄 Syncing schema: ${schema}`);

      // Create a new Sequelize instance for the schema
      const tenantSequelize = new Sequelize(
        process.env.DATABASE_URL as string,
        {
          dialect: "postgres",
          logging: false,
          define: { schema },
        }
      );

      const TenantUser = getTenantModel(User, schema);
      const TenantCompany = getTenantModel(Company, schema);

      // Sync models
      await TenantUser.sync({ alter: true });
      await TenantCompany.sync({ alter: true });
      debugLog(`✅ Synced schema: ${schema}`);
    }
  } catch (error) {
    debugLog("❌ Error syncing tenant schemas:", error);
  }
}
