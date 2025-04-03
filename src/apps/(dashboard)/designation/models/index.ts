import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface DesignationAttributes {
  id: number;
  name: string;
  corporate: string;
  division: string;
  group: string;
  department: string;
  unit: string;
}

export interface DesignationCreationAttributes extends Optional<DesignationAttributes, "id"> {}

class Designation extends Model<DesignationAttributes, DesignationCreationAttributes> implements DesignationAttributes {
  public id!: number;
  public name!: string;
  public corporate!: string;
  public division!: string;
  public group!: string;
  public department!: string;
  public unit!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Designation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       corporate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       division: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "designation",
    modelName: "Designation",
    timestamps: true,
  }
);

Organization.hasMany(Designation, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "designation",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Designation.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default Designation;
