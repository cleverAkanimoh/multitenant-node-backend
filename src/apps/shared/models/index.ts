import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../core/orm";
import { Roles } from "../../users/models/user";

export interface GlobalUserAttributes {
  id: string;
  tenantId: string;
  name: string;
  password: string;
  email: string;
  userRole: Roles;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GlobalUserCreationAttributes
  extends Optional<GlobalUserAttributes, "id"> {}

class GlobalUser
  extends Model<GlobalUserAttributes, GlobalUserCreationAttributes>
  implements GlobalUserAttributes
{
  public id!: string;
  public tenantId!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public userRole!: Roles;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GlobalUser.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userRole: {
      type: DataTypes.ENUM,
      values: Object.values(Roles),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "global_users",
    modelName: "GlobalUser",
    schema: "public",
    timestamps: true,
  }
);

export default GlobalUser;
