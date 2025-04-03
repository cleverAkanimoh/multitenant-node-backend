
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Designations from "../models";

export const DesignationsSchema = Joi.object({
  name: Joi.string().required(),
  corporate: Joi.string().required(),
  division: Joi.string().required(),
  group: Joi.string().required(),
  department: Joi.string().required(),
  unit: Joi.string().required(),
});

const DesignationsController = new ModelViewSet({
  model: Designations,
  schema: DesignationsSchema,
});

export default DesignationsController;
