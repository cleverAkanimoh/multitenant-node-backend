import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface PayrollAttributes {
  id: number;
  gradelevel: string;
  structuretype: string;
  rate: string;
  numberofwork: string;
  grossmoney: string;
  otherreceivableselement: string;
  otherreceivableselementgrosspercent: string;
  fixedreceivableselement: string;
  fixedreceivableselementgrosspercent: string;
  regulatoryreceivables: string;
  regulatoryrates: string;
  regulatoryreceivablesgrosspercent: string;
  regulatorydeductables: string;
  regulatorydeductablesgrosspercent: string;
  otherdeductables: string;
  otherdeductablesgrosspercent: string;
}

export interface PayrollCreationAttributes extends Optional<PayrollAttributes, "id"> {}

class Payroll extends Model<PayrollAttributes, PayrollCreationAttributes> implements PayrollAttributes {
  public id!: number;
  public gradelevel!: string;
  public structuretype!: string;
  public rate!: string;
  public numberofwork!: string;
  public grossmoney!: string;
  public otherreceivableselement!: string;
  public otherreceivableselementgrosspercent!: string;
  public fixedreceivableselement!: string;
  public fixedreceivableselementgrosspercent!: string;
  public regulatoryreceivables!: string;
  public regulatoryrates!: string;
  public regulatoryreceivablesgrosspercent!: string;
  public regulatorydeductables!: string;
  public regulatorydeductablesgrosspercent!: string;
  public otherdeductables!: string;
  public otherdeductablesgrosspercent!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payroll.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gradelevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       structuretype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       rate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       numberofwork: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       grossmoney: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       otherreceivableselement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       otherreceivableselementgrosspercent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       fixedreceivableselement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       fixedreceivableselementgrosspercent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       regulatoryreceivables: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       regulatoryrates: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       regulatoryreceivablesgrosspercent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       regulatorydeductables: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       regulatorydeductablesgrosspercent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       otherdeductables: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       otherdeductablesgrosspercent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "payroll",
    modelName: "Payroll",
    timestamps: true,
  }
);

Organization.hasMany(Payroll, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "payroll",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Payroll.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default Payroll;
