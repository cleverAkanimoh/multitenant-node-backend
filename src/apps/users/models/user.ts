import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../core/orm";

export enum Roles {
  STAFF = "staff",
  ADMIN = "admin",
  USER = "user",
  SUPERADMIN = "super_admin",
}

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  mfaSecret?: string;
  userRole?: Roles;
  isStaff?: boolean;
  isActive?: boolean;
  isMfaEnabled?: boolean;
  tenantId?: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public mfaSecret?: string;
  public userRole?: Roles;
  public isStaff?: boolean;
  public isActive?: boolean;
  public isMfaEnabled?: boolean;
  public tenantId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mfaSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.ENUM,
      values: Object.values(Roles),
      defaultValue: Roles.STAFF,
    },
    isStaff: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isMfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
  }
);

export default User;
