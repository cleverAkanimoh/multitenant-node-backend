import { Sequelize } from "sequelize";
import { debugLog } from "../utils/debugLog";
import sequelize from "./orm";

export const getTenantModel = (model: any, tenantSchema: string): any => {
  return model.schema(tenantSchema, { schemaDelimiter: "." });
};

export async function getTenantSchemas() {
  const [schemas] = await sequelize.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('public', 'pg_catalog', 'information_schema');`
  );

  console.log(schemas);

  return schemas.map((s: any) => s.schema_name);
}

export const createTenantSchema = async (tenantId: string) => {
  const newSchema = await sequelize.query(
    `CREATE SCHEMA IF NOT EXISTS "${tenantId}";`
  );

  debugLog(tenantId, " created successfully", { newSchema });
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
          define: {
            schema,
          },
        }
      );

      // Sync models
      await tenantSequelize.sync({ alter: true });
      debugLog(`✅ Synced schema: ${schema}`);
    }
  } catch (error) {
    debugLog("❌ Error syncing tenant schemas:", error);
  }
}
