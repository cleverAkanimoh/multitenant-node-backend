import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Company from "../../company/models";

export interface PerspectiveAttributes {
  id: number;
  name: string;
  createdBy: string;
  tenantId: string;
}

export interface PerspectiveCreationAttributes
  extends Optional<PerspectiveAttributes, "id"> {}

class Perspective
  extends Model<PerspectiveAttributes, PerspectiveCreationAttributes>
  implements PerspectiveAttributes
{
  public id!: number;
  public name!: string;
  public createdBy!: string;
  public tenantId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Perspective.init(
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
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "perspectives",
    modelName: "Perspective",
    timestamps: true,
  }
);

Company.hasMany(Perspective, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "perspectives",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Perspective.belongsTo(Company, {
  foreignKey: { name: "tenantId", allowNull: true },
  as: "company",
});

export default Perspective;
