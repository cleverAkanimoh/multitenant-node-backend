import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface CareerPathAttributes {
  id: number;
  name: string;
  level: string;
  educationalQualification: string;
  yearsOfExperience: string;
  minAge: string;
  maxAge: string;
  positionLifespan: string;
  slotsAvailable: string;
  annualPackage: string;
}

export interface CareerPathCreationAttributes
  extends Optional<CareerPathAttributes, "id"> {}

class CareerPath
  extends Model<CareerPathAttributes, CareerPathCreationAttributes>
  implements CareerPathAttributes
{
  public id!: number;
  public name!: string;
  public level!: string;
  public educationalQualification!: string;
  public yearsOfExperience!: string;
  public minAge!: string;
  public maxAge!: string;
  public positionLifespan!: string;
  public slotsAvailable!: string;
  public annualPackage!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CareerPath.init(
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
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    educationalQualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yearsOfExperience: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minAge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxAge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    positionLifespan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slotsAvailable: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    annualPackage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "careerpath",
    modelName: "CareerPath",
    timestamps: true,
  }
);

Organization.hasMany(CareerPath, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "careerpath",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

CareerPath.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default CareerPath;
