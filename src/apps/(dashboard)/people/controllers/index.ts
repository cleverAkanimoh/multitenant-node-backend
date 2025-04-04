
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import People from "../models";

export const PeopleSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  officialEmail: Joi.string().required(),
  personalPhoneNumber: Joi.string().required(),
  personalEmail: Joi.string().required(),
  address: Joi.string().required(),
  dateOfBirth: Joi.string().required(),
  educationDetailsInstitutions: Joi.string().required(),
  educationDetailsYears: Joi.string().required(),
  educationDetailsQualifications: Joi.string().required(),
  guarantor1FirstName: Joi.string().required(),
  guarantor1LastName: Joi.string().required(),
  guarantor1Address: Joi.string().required(),
  guarantor1Occupation: Joi.string().required(),
  guarantor1Age: Joi.string().required(),
  guarantor2FirstName: Joi.string().required(),
  guarantor2LastName: Joi.string().required(),
  guarantor2Address: Joi.string().required(),
  guarantor2Occupation: Joi.string().required(),
  guarantor2Age: Joi.string().required(),
  description: Joi.string().required(),
  role: Joi.string().required(),
  dateEmployed: Joi.string().required(),
  corporateName: Joi.string().required(),
  divisionName: Joi.string().required(),
  groupName: Joi.string().required(),
  departmentName: Joi.string().required(),
  unitName: Joi.string().required(),
  careerLevel: Joi.string().required(),
  designationName: Joi.string().required(),
});

const PeopleController = new ModelViewSet({
  model: People,
  schema: PeopleSchema,
});

export default PeopleController;
