import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../core/orm";
import Organization from "../../organization/models";

export interface PeopleAttributes {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmail: string;
  personalPhoneNumber: string;
  personalEmail: string;
  address: string;
  dateOfBirth: string;
  educationDetailsInstitutions: string;
  educationDetailsYears: string;
  educationDetailsQualifications: string;
  guarantor1FirstName: string;
  guarantor1LastName: string;
  guarantor1Address: string;
  guarantor1Occupation: string;
  guarantor1Age: string;
  guarantor2FirstName: string;
  guarantor2LastName: string;
  guarantor2Address: string;
  guarantor2Occupation: string;
  guarantor2Age: string;
  description: string;
  role: string;
  dateEmployed: string;
  corporateName: string;
  divisionName: string;
  groupName: string;
  departmentName: string;
  unitName: string;
  careerLevel: string;
  designationName: string;
}

export interface PeopleCreationAttributes extends Optional<PeopleAttributes, "id"> {}

class People extends Model<PeopleAttributes, PeopleCreationAttributes> implements PeopleAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public phoneNumber!: string;
  public officialEmail!: string;
  public personalPhoneNumber!: string;
  public personalEmail!: string;
  public address!: string;
  public dateOfBirth!: string;
  public educationDetailsInstitutions!: string;
  public educationDetailsYears!: string;
  public educationDetailsQualifications!: string;
  public guarantor1FirstName!: string;
  public guarantor1LastName!: string;
  public guarantor1Address!: string;
  public guarantor1Occupation!: string;
  public guarantor1Age!: string;
  public guarantor2FirstName!: string;
  public guarantor2LastName!: string;
  public guarantor2Address!: string;
  public guarantor2Occupation!: string;
  public guarantor2Age!: string;
  public description!: string;
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
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       officialEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       personalPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       personalEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       dateOfBirth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       educationDetailsInstitutions: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       educationDetailsYears: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       educationDetailsQualifications: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor1FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor1LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor1Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor1Occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor1Age: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor2FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor2LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor2Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor2Occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       guarantor2Age: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       dateEmployed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       corporateName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       divisionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       departmentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       unitName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       careerLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
       designationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "people",
    modelName: "People",
    timestamps: true,
  }
);

Organization.hasMany(People, {
  foreignKey: {
    name: "tenantId",
    allowNull: false,
  },
  as: "people",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

People.belongsTo(Organization, {
  foreignKey: { name: "tenantId", allowNull: false },
  as: "organization",
});

export default People;
