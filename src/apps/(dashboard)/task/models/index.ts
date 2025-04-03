import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface TaskAttributes {
  id: number;
  name: string;
  uplineInitiative: string;
  owner'sEmail: string;
  taskType: string;
  routineType: string;
  startDate: string;
  startTime: string;
  duration: string;
  repeatEvery: string;
  occursOnDaysWeekly: string;
  occursOnDayNumberMonthly: string;
  occursDayPositionMonthly: string;
  occursOnDayMonthly: string;
  endDate: string;
  afterOccurrence: string;
  reworkLimit: string;
  qualityTargetPoint: string;
  quantityTargetPoint: string;
  quantityTargetUnit: string;
  turnAroundTimeTargetPoint: string;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, "id"> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public name!: string;
  public uplineInitiative!: string;
  public owner'sEmail!: string;
  public taskType!: string;
  public routineType!: string;
  public startDate!: string;
  public startTime!: string;
  public duration!: string;
  public repeatEvery!: string;
  public occursOnDaysWeekly!: string;
  public occursOnDayNumberMonthly!: string;
  public occursDayPositionMonthly!: string;
  public occursOnDayMonthly!: string;
  public endDate!: string;
  public afterOccurrence!: string;
  public reworkLimit!: string;
  public qualityTargetPoint!: string;
  public quantityTargetPoint!: string;
  public quantityTargetUnit!: string;
  public turnAroundTimeTargetPoint!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
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
       uplineInitiative: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       owner'sEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       taskType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       routineType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       repeatEvery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       occursOnDaysWeekly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       occursOnDayNumberMonthly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       occursDayPositionMonthly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       occursOnDayMonthly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       endDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       afterOccurrence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       reworkLimit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       qualityTargetPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       quantityTargetPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       quantityTargetUnit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       turnAroundTimeTargetPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "task",
    modelName: "Task",
    timestamps: true,
  }
);

Organization.hasMany(Task, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "task",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Task.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default Task;
