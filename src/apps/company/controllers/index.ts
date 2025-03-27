import Joi from "joi";
import ModelViewSet from "../../../shared/ModelViewset";
import Company, { StructureLevel } from "../models";

export const companySchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  timezones: Joi.array().items(Joi.string()).min(1).required(),
  workDays: Joi.array()
    .items(
      Joi.string().valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      )
    )
    .min(1)
    .required(),
  workTimeRange: Joi.object({
    start: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // Validates HH:mm format (24-hour)
      .required(),
    end: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }).required(),
  structureLevel: Joi.string()
    .valid(...Object.values(StructureLevel))
    .required(),
  ownerId: Joi.string().uuid().optional(),
});


const CompanyController = new ModelViewSet(Company, companySchema);
export default CompanyController;
