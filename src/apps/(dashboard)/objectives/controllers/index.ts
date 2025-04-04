import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Objective from "../models";

export const ObjectiveSchema = Joi.object({
  name: Joi.string().required(),
  corporate: Joi.string().required(),
  routineType: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  afterOccurrence: Joi.number().integer().required(),
  perspectiveNames: Joi.string().required(),
  perspectiveRelativePoints: Joi.string().required(),
});

const ObjectiveController = new ModelViewSet({
  model: Objective,
  schema: ObjectiveSchema,
});

export default ObjectiveController;
