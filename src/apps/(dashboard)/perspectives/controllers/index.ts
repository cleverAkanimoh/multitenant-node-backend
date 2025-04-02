import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Perspective, { PerspectiveAttributes } from "../models";

export const PerspectiveSchema = Joi.object<PerspectiveAttributes>({
  id: Joi.number().optional(),
  name: Joi.string().required(),
  createdBy: Joi.string().required(),
  tenantId: Joi.string().required(),
});

const PerspectiveController = new ModelViewSet({
  model: Perspective,
  schema: PerspectiveSchema,
});

export default PerspectiveController;
