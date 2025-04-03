import Joi from "joi";

export const PeopleSchema = Joi.object({
  firstName: Joi.string().min(1).max(255).required(),
  lastName: Joi.string().min(1).max(255).required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
  officialEmail: Joi.string().email().required(),
  personalPhone: Joi.string().pattern(/^\d{10}$/),
  personalEmail: Joi.string().email(),
  address: Joi.string().min(1).max(255).required(),
  dateOfBirth: Joi.date().less("now").required(),
  education: Joi.object({
    institutions: Joi.array().items(Joi.string().min(1).max(255)).required(),
    years: Joi.array().items(Joi.string().min(1).max(255)).required(),
    qualifications: Joi.array().items(Joi.string().min(1).max(255)).required(),
  }).required(),
  guarantor1: Joi.object({
    firstName: Joi.string().min(1).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(),
  }).required(),
  guarantor2: Joi.object({
    firstName: Joi.string().min(1).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(),
  }).required(),
  description: Joi.string().max(500),
  role: Joi.string().min(1).max(255).required(),
  dateEmployed: Joi.date().less("now").required(),
  corporateName: Joi.string().min(1).max(255).required(),
  divisionName: Joi.string().min(1).max(255).required(),
  groupName: Joi.string().min(1).max(255).required(),
  departmentName: Joi.string().min(1).max(255).required(),
  unitName: Joi.string().min(1).max(255).required(),
  careerLevel: Joi.string().min(1).max(255).required(),
  designationName: Joi.string().min(1).max(255).required(),
});
