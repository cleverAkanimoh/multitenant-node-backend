import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface StructuralLevelAttributes {
  id: number;
  name: string;
  currentLevel: string;
  corporate: string;
  division: string;
  group: string;
  department: string;
  unit: string;
}

export interface StructuralLevelCreationAttributes extends Optional<StructuralLevelAttributes, "id"> {}

class StructuralLevel extends Model<StructuralLevelAttributes, StructuralLevelCreationAttributes> implements StructuralLevelAttributes {
  public id!: number;
  public name!: string;
  public currentLevel!: string;
  public corporate!: string;
  public division!: string;
  public group!: string;
  public department!: string;
  public unit!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StructuralLevel.init(
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
       currentLevel: {
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
    tableName: "structurallevel",
    modelName: "StructuralLevel",
    timestamps: true,
  }
);

Organization.hasMany(StructuralLevel, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "structurallevel",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

StructuralLevel.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default StructuralLevel;
