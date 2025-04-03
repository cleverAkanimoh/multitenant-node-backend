import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Company from "../../company/models";

export interface KPIsModelAttributes {
  id: number;
  name: string;
  uplineObjective: string;
  uplineInitiative: string;
  createdByEmail: string;
  ownerEmail: string;
  routineType: string;
  startDate: string;
  endDate: string;
  afterOccurrence: string;
}

export interface KPIsCreationAttributes
  extends Optional<KPIsModelAttributes, "id"> {}

class KPIs
  extends Model<KPIsModelAttributes, KPIsCreationAttributes>
  implements KPIsModelAttributes
{
  public id!: number;
  public name!: string;
  public uplineObjective!: string;
  public uplineInitiative!: string;
  public createdByEmail!: string;
  public ownerEmail!: string;
  public routineType!: string;
  public startDate!: string;
  public endDate!: string;
  public afterOccurrence!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KPIs.init(
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
    uplineObjective: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uplineInitiative: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdByEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerEmail: {
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
    endDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    afterOccurrence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "kpis",
    modelName: "KPI",
    timestamps: true,
  }
);

Company.hasMany(KPIs, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "kpis",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

KPIs.belongsTo(Company, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "company",
});

export default KPIs;
