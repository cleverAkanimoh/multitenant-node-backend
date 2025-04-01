import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import User from "../../../users/models/user";

export enum StructureLevel {
  CORPORATE = "corporate",
  DIVISIONAL = "divisional",
  GROUP = "group",
  DEPARTMENT = "department",
  UNIT = "unit",
}

export interface CompanyAttributes {
  id: string;
  name?: string;
  shortName?: string;
  logo?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  primaryTimezone?: string;
  otherTimezones?: string[];
  primaryDateFormat?: string;
  otherDateFormats?: string[];
  workDays?: string[];
  workTimeRange?: { start: string; end: string };
  breakTimeRange?: { start: string; end: string };
  structureLevel?: StructureLevel;
  ownerId?: string;
}

export interface CompanyCreationAttributes
  extends Optional<CompanyAttributes, "id"> {}

class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  public id!: string;
  public name?: string;
  public shortName?: string;
  public logo?: string;
  public address?: string;
  public phoneNumber?: string;
  public email?: string;
  public primaryTimezone?: string;
  public otherTimezones?: string[];
  public primaryDateFormat?: string;
  public otherDateFormats?: string[];
  public workDays?: string[];
  public workTimeRange?: { start: string; end: string };
  public breakTimeRange?: { start: string; end: string };
  public structureLevel?: StructureLevel;
  public ownerId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryTimezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherTimezones: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    primaryDateFormat: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otherDateFormats: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    workDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    workTimeRange: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    breakTimeRange: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    structureLevel: {
      type: DataTypes.ENUM,
      values: Object.values(StructureLevel),
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "companies",
    modelName: "Company",
    timestamps: true,
  }
);

Company.hasMany(User, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "users",
  onDelete: "CASCADE",
});

User.belongsTo(Company, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "company",
});

export default Company;
