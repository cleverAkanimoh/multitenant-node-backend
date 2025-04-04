
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Tasks from "../models";

export const TasksSchema = Joi.object({
  name: Joi.string().required(),
  uplineInitiative: Joi.string().required(),
 createdBy: Joi.string().required(),
  taskType: Joi.string().required(),
  routineType: Joi.string().required(),
  startDate: Joi.string().required(),
  startTime: Joi.string().required(),
  duration: Joi.string().required(),
  repeatEvery: Joi.string().required(),
  occursOnDaysWeekly: Joi.string().required(),
  occursOnDayNumberMonthly: Joi.string().required(),
  occursDayPositionMonthly: Joi.string().required(),
  occursOnDayMonthly: Joi.string().required(),
  endDate: Joi.string().required(),
  afterOccurrence: Joi.string().required(),
  reworkLimit: Joi.string().required(),
  qualityTargetPoint: Joi.string().required(),
  quantityTargetPoint: Joi.string().required(),
  quantityTargetUnit: Joi.string().required(),
  turnAroundTimeTargetPoint: Joi.string().required(),
});

const TasksController = new ModelViewSet({
  model: Tasks,
  schema: TasksSchema,
});

export default TasksController;
