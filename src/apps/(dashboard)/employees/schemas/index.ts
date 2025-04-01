const Joi = require("joi");

// Define the schema
const peopleSchema = Joi.object({
  firstName: Joi.string().min(1).max(255).required(),
  lastName: Joi.string().min(1).max(255).required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required(),
  officialEmail: Joi.string().email().required(),
  personalPhone: Joi.string().pattern(/^\d{10}$/),
  personalEmail: Joi.string().email(),
  address: Joi.string().min(1).max(255).required(),
  dateOfBirth: Joi.date().less("now").required(),
  education: Joi.object({
    institutions: Joi.array().items(Joi.string().min(1).max(255)).required(),
    years: Joi.array().items(Joi.string().min(1).max(255)).required(),
    qualifications: Joi.array().items(Joi.string().min(1).max(255)).required(),
  }).required(),
  guarantor1: Joi.object({
    firstName: Joi.string().min(1).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(),
  }).required(),
  guarantor2: Joi.object({
    firstName: Joi.string().min(1).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(255).required(),
    occupation: Joi.string().min(1).max(255).required(),
    age: Joi.number().min(18).required(),
  }).required(),
  description: Joi.string().max(500),
  role: Joi.string().min(1).max(255).required(),
  dateEmployed: Joi.date().less("now").required(),
  corporateName: Joi.string().min(1).max(255).required(),
  divisionName: Joi.string().min(1).max(255).required(),
  groupName: Joi.string().min(1).max(255).required(),
  departmentName: Joi.string().min(1).max(255).required(),
  unitName: Joi.string().min(1).max(255).required(),
  careerLevel: Joi.string().min(1).max(255).required(),
  designationName: Joi.string().min(1).max(255).required(),
});

// Example validation function
const validatePeople = (peopleData: any) => {
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
