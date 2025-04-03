import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface DesignationsAttributes {
  id: number;
  name: string;
  corporate: string;
  division: string;
  group: string;
  department: string;
  unit: string;
}

export interface DesignationsCreationAttributes extends Optional<DesignationsAttributes, "id"> {}

class Designations extends Model<DesignationsAttributes, DesignationsCreationAttributes> implements DesignationsAttributes {
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

Designations.init(
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
    tableName: "designations",
    modelName: "Designations",
    timestamps: true,
  }
);

Organization.hasMany(Designations, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "designations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Designations.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default Designations;
