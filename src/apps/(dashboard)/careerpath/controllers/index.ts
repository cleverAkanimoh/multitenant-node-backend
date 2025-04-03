
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import CareerPath from "../models";

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

const CareerPathController = new ModelViewSet({
  model: CareerPath,
  schema: CareerPathSchema,
});

export default CareerPathController;
