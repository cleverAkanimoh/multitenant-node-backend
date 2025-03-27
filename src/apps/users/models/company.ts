import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../core/orm";
import User, { Roles } from "./user";

export enum StructureLevel {
  CORPORATE = "corporate",
  DIVISIONAL = "divisional",
  GROUP = "group",
  DEPARTMENT = "department",
  UNIT = "unit",
}

export interface CompanyAttributes {
  id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  timezones: string[];
  workDays: string[];
  workTimeRange: { start: string; end: string };
  structureLevel: StructureLevel;
  ownerId?: string;
}

export interface CompanyCreationAttributes
  extends Optional<CompanyAttributes, "id"> {}

class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  public id!: string;
  public name!: string;
  public address?: string;
  public phoneNumber?: string;
  public email?: string;
  public timezones!: string[];
  public workDays!: string[];
  public workTimeRange!: { start: string; end: string };
  public structureLevel!: StructureLevel;
  public ownerId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    timezones: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    workDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    workTimeRange: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    structureLevel: {
      type: DataTypes.ENUM(
        StructureLevel.CORPORATE,
        StructureLevel.DIVISIONAL,
        StructureLevel.GROUP,
        StructureLevel.DEPARTMENT,
        StructureLevel.UNIT
      ),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "companies",
    modelName: "Company",
    timestamps: true,
  }
);

// Define associations
Company.hasMany(User, {
  foreignKey: "tenantId",
  as: "users",
});
User.belongsTo(Company, {
  foreignKey: "tenantId",
  as: "company",
});

// Auto-assign owner (oldest superadmin)
Company.beforeCreate(async (company) => {
  const oldestSuperAdmin = await User.findOne({
    where: { userRole: Roles.SUPERADMIN },
    order: [["createdAt", "ASC"]],
  });
  if (oldestSuperAdmin) {
    company.ownerId = oldestSuperAdmin.id;
  }
});

export default Company;
