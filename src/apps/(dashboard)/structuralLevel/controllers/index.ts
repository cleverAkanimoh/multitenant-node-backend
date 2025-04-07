
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import StructuralLevel from "../models";

export const StructuralLevelSchema = Joi.object({
  name: Joi.string().required(),
  currentLevel: Joi.string().required(),
  corporate: Joi.string().required(),
  division: Joi.string().required(),
  group: Joi.string().required(),
  department: Joi.string().required(),
  unit: Joi.string().required(),
});

const StructuralLevelController = new ModelViewSet({
  model: StructuralLevel,
  schema: StructuralLevelSchema,
});

export default StructuralLevelController;
