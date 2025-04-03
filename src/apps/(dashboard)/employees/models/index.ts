import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";

export interface PeopleAttributes {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmail: string;
  personalPhone?: string;
  personalEmail?: string;
  address: string;
  dateOfBirth: string;
  education: Record<string, any>;
  guarantor1: Record<string, any>;
  guarantor2: Record<string, any>;
  description?: string;
  role: string;
  dateEmployed: string;
  corporateName: string;
  divisionName: string;
  groupName: string;
  departmentName: string;
  unitName: string;
  careerLevel: string;
  designationName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PeopleCreationAttributes
  extends Optional<PeopleAttributes, "id" | "createdAt" | "updatedAt"> {}

class People
  extends Model<PeopleAttributes, PeopleCreationAttributes>
  implements PeopleAttributes
{
  public id?: string;
  public firstName!: string;
  public lastName!: string;
  public phoneNumber!: string;
  public officialEmail!: string;
  public personalPhone?: string;
  public personalEmail?: string;
  public address!: string;
  public dateOfBirth!: string;
  public education!: Record<string, any>;
  public guarantor1!: Record<string, any>;
  public guarantor2!: Record<string, any>;
  public description?: string;
  public role!: string;
  public dateEmployed!: string;
  public corporateName!: string;
  public divisionName!: string;
  public groupName!: string;
  public departmentName!: string;
  public unitName!: string;
  public careerLevel!: string;
  public designationName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

People.init(
  {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    officialEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    personalPhone: { type: DataTypes.STRING },
    personalEmail: { type: DataTypes.STRING, validate: { isEmail: true } },
    address: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
    education: { type: DataTypes.JSONB, allowNull: false },
    guarantor1: { type: DataTypes.JSONB, allowNull: false },
    guarantor2: { type: DataTypes.JSONB, allowNull: false },
    description: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, allowNull: false },
    dateEmployed: { type: DataTypes.DATEONLY, allowNull: false },
    corporateName: { type: DataTypes.STRING, allowNull: false },
    divisionName: { type: DataTypes.STRING, allowNull: false },
    groupName: { type: DataTypes.STRING, allowNull: false },
    departmentName: { type: DataTypes.STRING, allowNull: false },
    unitName: { type: DataTypes.STRING, allowNull: false },
    careerLevel: { type: DataTypes.STRING, allowNull: false },
    designationName: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "People",
    tableName: "people",
    timestamps: true,
  }
);

export default People;
