import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize";

class People extends Model {}

People.init(
  {
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    phone_number: { type: DataTypes.STRING, allowNull: false },
    official_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    personal_phone: { type: DataTypes.STRING },
    personal_email: { type: DataTypes.STRING, validate: { isEmail: true } },
    address: { type: DataTypes.STRING, allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
    education: { type: DataTypes.JSONB, allowNull: false },
    guarantor1: { type: DataTypes.JSONB, allowNull: false },
    guarantor2: { type: DataTypes.JSONB, allowNull: false },
    description: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, allowNull: false },
    date_employed: { type: DataTypes.DATEONLY, allowNull: false },
    corporate_name: { type: DataTypes.STRING, allowNull: false },
    division_name: { type: DataTypes.STRING, allowNull: false },
    group_name: { type: DataTypes.STRING, allowNull: false },
    department_name: { type: DataTypes.STRING, allowNull: false },
    unit_name: { type: DataTypes.STRING, allowNull: false },
    career_level: { type: DataTypes.STRING, allowNull: false },
    designation_name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
    timestamps: true,
  }
);

export default People;
