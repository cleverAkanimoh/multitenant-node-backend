import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Company, { StructureLevel } from "../models";

export const companySchema = Joi.object({
  name: Joi.string().optional(),
  shortName: Joi.string().optional(),
  logo: Joi.alternatives()
    .try(
      Joi.string().uri(),
      Joi.string().pattern(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/i)
    )
    .required(),
  address: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  email: Joi.string().email().optional(),
  primaryTimezone: Joi.string().required(),
  otherTimezones: Joi.array().items(Joi.string()).optional(),
  primaryDateFormat: Joi.string().required(),
  otherDateFormats: Joi.array().items(Joi.string()).optional(),
  workDays: Joi.array().items(
    Joi.string().valid(
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday"
    )
  ),
  workTimeRange: Joi.object({
    start: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    end: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }).required(),
  breakTimeRange: Joi.object({
    start: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    end: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }).required(),
  structureLevel: Joi.string()
    .valid(...Object.values(StructureLevel))
    .optional(),
});


const CompanyController = new ModelViewSet(Company, companySchema);


export default CompanyController;
