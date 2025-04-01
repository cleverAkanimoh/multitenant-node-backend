const Joi = require("joi");

// Define the schema
const peopleSchema = Joi.object({
  firstname: Joi.string().min(1).max(255).required(),
  lastname: Joi.string().min(1).max(255).required(),
  phone_number: Joi.string()
    .pattern(/^\d{10}$/)
    .required(), // 10-digit phone number
  official_email: Joi.string().email().required(),
  personal_phone: Joi.string().pattern(/^\d{10}$/), // Optional personal phone
  personal_email: Joi.string().email(),
  address: Joi.string().min(1).max(255).required(),
  date_of_birth: Joi.date().less("now").required(), // Ensure the date is in the past
  education: Joi.object({
    institutions: Joi.array().items(Joi.string().min(1).max(255)).required(),
    years: Joi.array().items(Joi.string().min(1).max(255)).required(),
    qualifications: Joi.array().items(Joi.string().min(1).max(255)).required(),
  }).required(),
  guarantor1: Joi.object({
    firstname: Joi.string().min(1).max(255).required(),
    lastname: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(), // Ensure age is at least 18
  }).required(),
  guarantor2: Joi.object({
    firstname: Joi.string().min(1).max(255).required(),
    lastname: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(), // Ensure age is at least 18
  }).required(),
  description: Joi.string().max(500),
  role: Joi.string().min(1).max(255).required(),
  date_employed: Joi.date().less("now").required(), // Ensure the date is in the past
  corporate_name: Joi.string().min(1).max(255).required(),
  division_name: Joi.string().min(1).max(255).required(),
  group_name: Joi.string().min(1).max(255).required(),
  department_name: Joi.string().min(1).max(255).required(),
  unit_name: Joi.string().min(1).max(255).required(),
  career_level: Joi.string().min(1).max(255).required(),
  designation_name: Joi.string().min(1).max(255).required(),
});

// Example validation function
const validatePeople = (peopleData) => {
  const { error, value } = peopleSchema.validate(peopleData);
  if (error) {
    console.log("Validation Error:", error.details);
    return false;
  } else {
    console.log("Valid People Data:", value);
    return true;
  }
};

// Example data to validate
const peopleData = {
  firstname: "",
  lastname: "",
  phone_number: "",
  official_email: "",
  personal_phone: "",
  personal_email: "",
  address: "",
  date_of_birth: "",
  education: {
    institutions: ["", ""],
    years: ["", ""],
    qualifications: ["", ""],
  },
  guarantor1: {
    firstname: "",
    lastname: "",
    address: "",
    occupation: "",
    age: 40,
  },
  guarantor2: {
    firstname: "",
    lastname: "",
    address: "",
    occupation: "",
    age: 35,
  },
  description: "",
  role: "",
  date_employed: "",
  corporate_name: "",
  division_name: "",
  group_name: "",
  department_name: "",
  unit_name: "",
  career_level: "",
  designation_name: "",
};

validatePeople(peopleData);
