import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Objective from "../models";

export const ObjectiveSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  corporate: Joi.string().required(),
  routineType: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  afterOccurrence: Joi.number().integer().required(),
  perspectives: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
        relativePoint: Joi.number().integer().required(),
      })
    )
    .required(),
  tenantId: Joi.string().optional(),
  createdBy: Joi.string().optional(),
  status: Joi.string().valid("pending", "active", "close").optional(),
});

const ObjectiveController = new ModelViewSet({
  model: Objective,
  schema: ObjectiveSchema,
});

export default ObjectiveController;
