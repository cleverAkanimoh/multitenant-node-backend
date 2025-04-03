
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Designation from "../models";

export const DesignationSchema = Joi.object({
  name: Joi.string().required(),
  corporate: Joi.string().required(),
  division: Joi.string().required(),
  group: Joi.string().required(),
  department: Joi.string().required(),
  unit: Joi.string().required(),
});

const DesignationController = new ModelViewSet({
  model: Designation,
  schema: DesignationSchema,
});

export default DesignationController;
