import Joi from "joi";
import { Roles } from "../users/models/user";

const passName = {
  name: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
};

const passwordRegex =
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&.]{6,}$";

const minPasswordLength = 6;

export const userSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  tenantId: Joi.string().required(),
  password: Joi.string()
    .min(minPasswordLength)
    .pattern(new RegExp(passwordRegex))
    .required(),
  // .messages({ "string.pattern.base": passName }),
  userRole: Joi.string()
    .valid(...Object.values(Roles))
    .required(),
  // .messages({
  //   "any.only": "User role must be one of 'employee', 'hr', or 'employer'.",
  // })
  isStaff: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  mfaSecret: Joi.string().optional(),
  isMfaEnabled: Joi.boolean().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(minPasswordLength)
    .pattern(new RegExp(passwordRegex), passName)
    .required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("user", "company").required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  type: Joi.string().valid("user", "company").required(),
});

export const resendActivationEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid("user", "company").required(),
});

export const verifyAccountSchema = Joi.object({
  token: Joi.string().required(),
});
