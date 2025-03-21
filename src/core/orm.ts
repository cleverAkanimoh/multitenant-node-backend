import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  logging: process.env.NODE_ENV === "development",
});

export default sequelize;

export const getTenantModel = <T>(model: any, tenantSchema: string): T => {
  return model.schema(tenantSchema);
};
