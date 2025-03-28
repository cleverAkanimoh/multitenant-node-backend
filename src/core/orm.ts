import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  dialectOptions: {
    ssl:
      process.env.NODE_ENV !== "development"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
  // host: process.env.DB_HOST,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // database: process.env.DB_NAME,
  // port: Number(process.env.DB_PORT),
  logging: false,
});

export default sequelize;

export const createTenantSchema = async (tenantId: string) => {
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}";`);
};

export const getTenantModel = <T>(model: any, tenantSchema: string): T => {
  return model.schema(tenantSchema);
};
