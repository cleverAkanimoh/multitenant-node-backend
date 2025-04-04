import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export enum RoutineType {
  ONCE = "once",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  BI_ANNUALLY = "bi-Annually",
  ANNUALLY = "annually",
}

export enum Status {
  PENDING = "pending",
  ACTIVE = "active",
  CLOSE = "close",
}

export interface ObjectiveAttributes {
  id: number;
  name: string;
  corporate: string;
  routineType: RoutineType;
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
  status: Status;
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
  public routineType!: RoutineType;
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
  public status!: Status;

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
      type: DataTypes.ENUM(
        RoutineType.ONCE,
        RoutineType.MONTHLY,
        RoutineType.QUARTERLY,
        RoutineType.BI_ANNUALLY,
        RoutineType.ANNUALLY
      ),
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
      type: DataTypes.ENUM(Status.PENDING, Status.ACTIVE, Status.CLOSE),
      allowNull: false,
      defaultValue: Status.PENDING,
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
