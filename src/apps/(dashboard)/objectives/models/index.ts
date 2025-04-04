import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface ObjectiveAttributes {
  id: number;
  name: string;
  corporate: string;
  routineType: string;
  startDate: Date;
  endDate?: Date;
  afterOccurrence: number;
  perspectives: {
    id: number;
    name: string;
    relativePoint: number;
  }[];
  tenantId?: string;
  createdBy?: string;
  status: "pending" | "active" | "close";
}

export interface ObjectiveCreationAttributes
  extends Optional<ObjectiveAttributes, "id"> {}

class Objective
  extends Model<ObjectiveAttributes, ObjectiveCreationAttributes>
  implements ObjectiveAttributes
{
  public id!: number;
  public name!: string;
  public corporate!: string;
  public routineType!: string;
  public startDate!: Date;
  public endDate?: Date;
  public afterOccurrence!: number;
  public perspectives!: {
    id: number;
    name: string;
    relativePoint: number;
  }[];
  public createdBy!: string;
  public tenantId!: string;
  public status!: "pending" | "active" | "close";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Objective.init(
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
    routineType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    afterOccurrence: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    perspectives: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "close"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "objectives",
    modelName: "Objective",
    timestamps: true,
  }
);

export default Objective;

Organization.hasMany(Objective, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "objectives",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Objective.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: true },
  as: "organization",
});
