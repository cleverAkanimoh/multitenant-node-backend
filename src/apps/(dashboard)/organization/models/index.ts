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

export interface OrganizationAttributes {
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
  structureLevel?: string[];
  ownerId?: string;
}

export interface OrganizationCreationAttributes
  extends Optional<OrganizationAttributes, "id"> {}

class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
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
  public structureLevel?: string[];
  public ownerId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "organizations",
    modelName: "Organization",
    timestamps: true,
  }
);

Organization.hasMany(User, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "users",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default Organization;
