import { QueryTypes } from "sequelize";
import CareerPath from "../apps/(dashboard)/careerpath/models";
import Designations from "../apps/(dashboard)/designations/models";
import KPIs from "../apps/(dashboard)/kpis/models";
import Objective from "../apps/(dashboard)/objectives/models";
import Organization from "../apps/(dashboard)/organization/models";
import Payroll from "../apps/(dashboard)/payroll/models";
import People from "../apps/(dashboard)/people/models";
import Perspective from "../apps/(dashboard)/perspectives/models";
import Tasks from "../apps/(dashboard)/tasks/models";
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

export async function syncSchemas() {
  try {
    debugLog("Synchronizing Public Schema(s)");

    await Organization.sync({ alter: true });
    debugLog(`✅ Organization synchronized.`);

    await User.sync({ alter: true });
    debugLog(`✅ User synchronized.`);

    const tenantSchemas = await getTenantSchemas();

    for (const schema of tenantSchemas) {
      debugLog(`🔄 Syncing Tenant schema ${schema}`);

      const TenantUser = getTenantModel(User, schema);
      const TenantPerspective = getTenantModel(Perspective, schema);
      const TenantObjective = getTenantModel(Objective, schema);
      const TenantKPIs = getTenantModel(KPIs, schema);
      const TenantTasks = getTenantModel(Tasks, schema);
      const TenantPayroll = getTenantModel(Payroll, schema);
      const TenantPeople = getTenantModel(People, schema);
      const TenantDesignations = getTenantModel(Designations, schema);
      const TenantCareerPath = getTenantModel(CareerPath, schema);

      const modelsToSync = [
        // User,
        // Organization,
        TenantUser,
        TenantPerspective,
        TenantObjective,
        TenantKPIs,
        TenantTasks,
        TenantPayroll,
        TenantPeople,
        TenantDesignations,
        TenantCareerPath,
      ];

      for (const model of modelsToSync) {
        await model.sync({ alter: true });
        debugLog(`✅ ${model.name} synchronized.`);
      }
    }
  } catch (error) {
    debugLog("❌ Error syncing schemas:", error);
  }
}
