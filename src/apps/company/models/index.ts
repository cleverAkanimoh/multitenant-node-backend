import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../core/orm";
import User, { Roles } from "../../users/models/user";

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
  address?: string;
  phoneNumber?: string;
  email?: string;
  timezones?: string[];
  workDays?: string[];
  workTimeRange?: { start: string; end: string };
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
  public address?: string;
  public phoneNumber?: string;
  public email?: string;
  public timezones?: string[];
  public workDays?: string[];
  public workTimeRange?: { start: string; end: string };
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
    structureLevel: {
      type: DataTypes.ENUM,
      values: Object.values(StructureLevel),
      allowNull: true,
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

Company.hasMany(User, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "users",
  onDelete: "CASCADE",
});
User.belongsTo(Company, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "company",
});

Company.beforeCreate(async (company) => {
  if (!company.ownerId) {
    const oldestSuperAdmin = await User.findOne({
      where: { userRole: Roles.SUPERADMIN },
      order: [["createdAt", "ASC"]],
    });
    if (oldestSuperAdmin) {
      company.ownerId = oldestSuperAdmin.id;
    }
  }
});

export default Company;
