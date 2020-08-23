import Joi from '@hapi/joi';
import { HttpError } from '../../utils/errorHandler';

export type ValidationSchema = keyof typeof schemas;

const schemas = {
  //  SIGNUP
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().max(255).required(),
    lastName: Joi.string().max(255).required(),
  }),

  //  LOGIN
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  //  PROFILE
  profile: Joi.object({
    firstName: Joi.string().max(255),
    lastName: Joi.string().max(255),
    gender: Joi.string(),
    age: Joi.number().min(1).max(200),
    bio: Joi.string().max(5000),
    location: Joi.string().max(255),
  }),

  //  POST
  post: Joi.object({
    title: Joi.string().min(1).max(512).required(),
    body: Joi.string().min(1).max(10000).required(),
  }),

  //  EMAIL
  email: Joi.string().min(2).max(255).email().required(),

  //  PASSWORD
  password: Joi.string().min(6).max(255).required(),

  //  ID
  // id: Joi.custom((id) => {
  //   if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError('its not a valid id', 400);
  //   return true;
  // }),
};

const validate = <T>(inputToValidate: T, schema: ValidationSchema): T => {
  const { value, error } = schemas[schema].validate(inputToValidate);

  if (error) throw new HttpError('Invalid input. ' + error.message, 400);

  return value;
};

export default validate;
