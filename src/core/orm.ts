import { Sequelize } from "sequelize-typescript";
import { User } from "../apps/authentication/models/users";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [User],
  logging: true,
});

export default sequelize;

export const getTenantModel = <T>(model: any, tenantSchema: string): T => {
  return model.schema(tenantSchema);
};