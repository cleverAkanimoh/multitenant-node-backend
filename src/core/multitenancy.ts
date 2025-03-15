import sequelize from "./orm";

export const ensureTenantSchema = async (
  tenantSchema: string
) => {
  console.log("creating new schema for " , tenantSchema);
  
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${tenantSchema}";`);
};
