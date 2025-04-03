import Joi from "joi";

export const CareerPathSchema = Joi.object({
  name: Joi.string().required(),
  level: Joi.string().required(),
  educationalQualification: Joi.string().required(),
  yearsOfExperience: Joi.string().required(),
  minAge: Joi.string().required(),
  maxAge: Joi.string().required(),
  positionLifespan: Joi.string().required(),
  slotsAvailable: Joi.string().required(),
  annualPackage: Joi.string().required(),
});
