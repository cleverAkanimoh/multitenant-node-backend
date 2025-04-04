import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import KPIs from "../models";

export const KPISchema = Joi.object({
  name: Joi.string().required(),
  uplineObjective: Joi.string().required(),
  uplineInitiative: Joi.string().required(),
  createdBy: Joi.string().required(),
  ownersEmail: Joi.string().required(),
  routineType: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  afterOccurrence: Joi.string().required(),
});

const KPIController = new ModelViewSet({
  model: KPIs,
  schema: KPISchema,
});

export default KPIController;
