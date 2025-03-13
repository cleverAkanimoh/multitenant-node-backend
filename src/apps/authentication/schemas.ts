import Joi from "joi";

const passName = {
  name: "Password has to contain an uppercase lowercases letters, numbers and special characters",
};

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  designerId: Joi.string().required(),
});

export const designerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
      ),
      passName
    )
    .required(),
  bio: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  socials: Joi.array().items(Joi.string().uri()).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$"
      ),
      passName
    )
    .required(),
});
