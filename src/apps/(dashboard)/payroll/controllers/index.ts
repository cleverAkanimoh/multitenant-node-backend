
import Joi from "joi";
import ModelViewSet from "../../../shared/controllers/ModelViewset";
import Payroll from "../models";

export const PayrollSchema = Joi.object({
  gradelevel: Joi.string().required(),
  structuretype: Joi.string().required(),
  rate: Joi.string().required(),
  numberofwork: Joi.string().required(),
  grossmoney: Joi.string().required(),
  otherreceivableselement: Joi.string().required(),
  otherreceivableselementgrosspercent: Joi.string().required(),
  fixedreceivableselement: Joi.string().required(),
  fixedreceivableselementgrosspercent: Joi.string().required(),
  regulatoryreceivables: Joi.string().required(),
  regulatoryrates: Joi.string().required(),
  regulatoryreceivablesgrosspercent: Joi.string().required(),
  regulatorydeductables: Joi.string().required(),
  regulatorydeductablesgrosspercent: Joi.string().required(),
  otherdeductables: Joi.string().required(),
  otherdeductablesgrosspercent: Joi.string().required(),
});

const PayrollController = new ModelViewSet({
  model: Payroll,
  schema: PayrollSchema,
});

export default PayrollController;
