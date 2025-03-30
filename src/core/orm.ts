import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();
console.log(process.env.DATABASE_URL)

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  // dialectOptions: {
  //   ssl:
  //     process.env.NODE_ENV !== "development"
  //       ? { require: true, rejectUnauthorized: false }
  //       : false,
  // },
  logging: false,
});

export default sequelize;
